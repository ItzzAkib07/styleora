import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Shield,
  ArrowUpRight,
  Sparkles,
  Copy,
  CheckCheck,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Plus,
  Info,
  Lock,
  CreditCard,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { CORE_PACKAGE, ADD_ONS, getAddOnById } from '@/constants/packages';
import { consultationService } from '@/services/consultationService';
import { paymentService } from '@/services/paymentService';
import { loadRazorpayScript } from '@/utils/razorpay';
import { AtelierContainer, SectionHeading, Card, Button, SEO } from '@/components/ui';

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{8,25}$/;

export const ConsultationPage = () => {
  const [selectedAddOnIds, setSelectedAddOnIds] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
    style_notes: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [createdConsultation, setCreatedConsultation] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Generate an idempotency key per form session to protect against duplicate submissions
  const idempotencyKeyRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  );

  const corePackage = CORE_PACKAGE;
  const selectedAddOns = ADD_ONS.filter((addon) => selectedAddOnIds.includes(addon.id));
  const addOnsTotalInr = selectedAddOns.reduce((acc, addon) => acc + addon.amountInr, 0);
  const totalEstimatedInr = corePackage.amountInr + addOnsTotalInr;
  const totalEstimatedFormatted = `₹${totalEstimatedInr.toLocaleString('en-IN')}`;

  const handleToggleAddOn = (addonId) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'customer_name':
        if (!value.trim()) return 'Full name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        if (/[<>{};\\\/]/.test(value)) return 'Name contains invalid characters.';
        return null;
      case 'email':
        if (!value.trim()) return 'Email address is required.';
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address.';
        return null;
      case 'phone':
        if (!value.trim()) return 'Phone number is required.';
        if (!PHONE_REGEX.test(value.trim())) return 'Please enter a valid phone number (8–20 digits).';
        return null;
      case 'address':
        if (!value.trim()) return 'Styling & delivery address is required.';
        if (value.trim().length < 5) return 'Address must be at least 5 characters.';
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (formErrors[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }
    if (serverError) setServerError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all required fields
    const errors = {};
    ['customer_name', 'email', 'phone', 'address'].forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorField = document.querySelector(`[name="${Object.keys(errors)[0]}"]`);
      if (firstErrorField) firstErrorField.focus();
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        customer_name: formData.customer_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        package_id: corePackage.id,
        selected_add_on_ids: selectedAddOnIds,
        style_notes: formData.style_notes.trim() || undefined,
        idempotency_key: idempotencyKeyRef.current,
      };

      const response = await consultationService.createConsultation(
        payload,
        idempotencyKeyRef.current
      );

      if (response?.data) {
        setCreatedConsultation(response.data);
        // Rotate idempotency key for subsequent consultation bookings
        idempotencyKeyRef.current =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setServerError(
        err?.message ||
          'We encountered an issue registering your consultation. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!createdConsultation?.consultation_code) return;
    navigator.clipboard.writeText(createdConsultation.consultation_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2400);
  };

  const handleInitiatePayment = async () => {
    if (!createdConsultation?.consultation_code || isPaying || isVerifying) return;
    setIsPaying(true);
    setPaymentError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to initialize secure checkout. Please check your internet connection.');
      }

      const orderRes = await paymentService.createPaymentOrder(createdConsultation.consultation_code);
      if (!orderRes?.success || !orderRes?.data) {
        throw new Error(orderRes?.error?.message || 'Unable to prepare payment checkout order.');
      }

      const orderData = orderRes.data;

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'STYLEORA',
        description: orderData.package_name || 'STYLEORA Signature Blueprint',
        order_id: orderData.order_id,
        prefill: {
          name: orderData.customer_name,
          email: orderData.email,
          contact: orderData.phone,
        },
        theme: {
          color: '#C5A880',
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
        handler: async (response) => {
          setIsVerifying(true);
          try {
            const verifyRes = await paymentService.verifyPayment({
              consultation_code: createdConsultation.consultation_code,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes?.success && verifyRes?.data) {
              setCreatedConsultation((prev) => ({
                ...prev,
                status: 'PAYMENT_SUCCESS',
                payment_id: verifyRes.data.payment_id,
                paid_at: verifyRes.data.paid_at,
              }));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              throw new Error(verifyRes?.error?.message || 'Payment verification failed.');
            }
          } catch (err) {
            setPaymentError(
              err?.message || 'Payment verification failed. Please contact concierge support with your reference code.'
            );
          } finally {
            setIsVerifying(false);
            setIsPaying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setPaymentError(
          response.error?.description || 'Payment was unsuccessful or declined by your provider. You may retry.'
        );
        setIsPaying(false);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(err?.message || 'Payment initialization error. Please try again.');
      setIsPaying(false);
    }
  };

  const handleResetForm = () => {
    setCreatedConsultation(null);
    setSelectedAddOnIds([]);
    setFormData({
      customer_name: '',
      email: '',
      phone: '',
      address: '',
      style_notes: '',
    });
    setFormErrors({});
    setServerError(null);
    setPaymentError(null);
    setIsPaying(false);
    setIsVerifying(false);
    idempotencyKeyRef.current =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEO
        title="Begin Your Style Journey — STYLEORA Signature Blueprint"
        description="Commission your STYLEORA Signature Blueprint. A complete personal styling experience combining a 30-minute private stylist consultation with a bespoke style blueprint for ₹2,799."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32 min-h-screen bg-obsidian">
        <AtelierContainer>
          {/* ========================================================================= */}
          {/* SUCCESS STATE: CONSULTATION RESERVED CONFIRMATION SCREEN                  */}
          {/* ========================================================================= */}
          {createdConsultation ? (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="bg-charcoal border border-champagne/40 p-8 sm:p-12 shadow-elevated relative overflow-hidden">
                {/* Gold Glow Ambient */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-muted-gold/10 rounded-full blur-3xl pointer-events-none" />

                {/* Eyebrow & Headline */}
                <div className="text-center mb-8">
                  {createdConsultation.status === 'PAYMENT_SUCCESS' ? (
                    <>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-atelier-success/15 border border-atelier-success/40 text-atelier-success text-[0.65rem] tracking-editorial-ultra uppercase mb-4 font-semibold">
                        <CheckCheck size={13} />
                        ATELIER LEDGER // PAYMENT CONFIRMED & RESERVATION SECURED
                      </span>
                      <h1 className="font-editorial text-3xl sm:text-5xl text-warm-ivory font-normal mb-3">
                        Payment Confirmed.
                      </h1>
                      <p className="text-ivory-muted text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
                        Your private styling investment has been verified by the STYLEORA atelier ledger. 
                        Your bespoke 1:1 consultation is officially secured.
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-champagne/10 border border-champagne/30 text-champagne text-[0.65rem] tracking-editorial-ultra uppercase mb-4 font-semibold">
                        <Sparkles size={12} />
                        ATELIER LEDGER // RESERVATION CONFIRMED (AWAITING CHECKOUT)
                      </span>
                      <h1 className="font-editorial text-3xl sm:text-5xl text-warm-ivory font-normal mb-3">
                        Consultation Request Received.
                      </h1>
                      <p className="text-ivory-muted text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
                        Your styling reservation has been registered. Complete secure payment below to lock your preferred private stylist appointment.
                      </p>
                    </>
                  )}
                </div>

                {/* Consultation Reference Card */}
                <div className="bg-obsidian border border-border-subtle p-6 mb-8 text-center relative">
                  <span className="text-[0.68rem] tracking-editorial-ultra text-muted-gold uppercase block mb-1">
                    Official Consultation Reference Code
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-cinzel text-2xl sm:text-3xl tracking-widest text-champagne font-bold select-all">
                      {createdConsultation.consultation_code}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      title="Copy Reference Code"
                      className="p-2 border border-border-subtle hover:border-champagne text-stone hover:text-champagne transition-colors"
                      type="button"
                    >
                      {copiedCode ? <CheckCheck size={18} className="text-atelier-success" /> : <Copy size={18} />}
                    </button>
                  </div>
                  {copiedCode && (
                    <span className="text-[0.65rem] text-atelier-success tracking-editorial-wide block mt-1">
                      Copied to clipboard
                    </span>
                  )}
                </div>

                {/* Payment Error Banner if applicable */}
                {paymentError && (
                  <div className="bg-red-950/40 border border-red-800/60 p-4 mb-8 text-red-200 text-xs flex items-start gap-3">
                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1">Payment Interrupted</p>
                      <p className="text-red-300 font-light">{paymentError}</p>
                    </div>
                  </div>
                )}

                {/* Reservation Details Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border-subtle text-sm">
                  <div>
                    <span className="text-xs text-stone tracking-editorial-wide uppercase block mb-1">
                      Primary Experience
                    </span>
                    <p className="font-editorial text-xl text-warm-ivory font-normal">
                      {createdConsultation.package_name}
                    </p>
                    <span className="text-xs text-muted-gold font-medium">
                      {createdConsultation.package_price}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-stone tracking-editorial-wide uppercase block mb-1">
                      Ledger Status
                    </span>
                    {createdConsultation.status === 'PAYMENT_SUCCESS' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-atelier-success bg-atelier-success/10 px-2.5 py-1 border border-atelier-success/30 font-cinzel tracking-wider">
                        <CheckCheck size={13} className="text-atelier-success" />
                        PAYMENT_SUCCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-champagne bg-surface-subtle px-2.5 py-1 border border-border-subtle font-cinzel tracking-wider">
                        <Clock size={13} className="text-muted-gold" />
                        {createdConsultation.status} (PAYMENT PENDING)
                      </span>
                    )}
                  </div>

                  {/* Selected Add-ons */}
                  {createdConsultation.selected_add_ons?.length > 0 && (
                    <div className="sm:col-span-2 bg-surface-subtle/50 p-4 border border-border-subtle">
                      <span className="text-xs text-muted-gold tracking-editorial-wide uppercase block mb-2 font-medium">
                        Selected Add-ons
                      </span>
                      <div className="space-y-1.5">
                        {createdConsultation.selected_add_ons.map((addon) => (
                          <div key={addon.add_on_id} className="flex justify-between items-center text-xs">
                            <span className="text-warm-ivory font-light">{addon.name}</span>
                            <span className="text-champagne font-editorial">{addon.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2 pt-2 flex justify-between items-center border-t border-border-subtle/60">
                    <span className="text-xs text-stone tracking-editorial-wide uppercase">
                      Total Consultation Investment:
                    </span>
                    <span className="font-editorial text-2xl text-champagne font-normal">
                      {createdConsultation.total_price_formatted || createdConsultation.package_price}
                    </span>
                  </div>

                  {createdConsultation.payment_id && (
                    <div className="sm:col-span-2 bg-surface-subtle/40 p-3 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="text-stone tracking-editorial-wide uppercase">Gateway Transaction ID:</span>
                      <span className="font-mono text-champagne select-all">{createdConsultation.payment_id}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-xs text-stone tracking-editorial-wide uppercase block mb-1">
                      Client
                    </span>
                    <p className="text-warm-ivory">{createdConsultation.customer_name}</p>
                    <p className="text-stone text-xs">{createdConsultation.email}</p>
                    <p className="text-stone text-xs">{createdConsultation.phone}</p>
                  </div>

                  <div>
                    <span className="text-xs text-stone tracking-editorial-wide uppercase block mb-1">
                      Styling Delivery Address
                    </span>
                    <p className="text-ivory-muted text-xs leading-relaxed">
                      {createdConsultation.address}
                    </p>
                  </div>
                </div>

                {/* Next Steps Protocol Notice */}
                <div className="bg-surface-subtle border border-border-subtle p-5 mb-8 text-xs leading-relaxed text-stone flex items-start gap-3">
                  <Shield size={18} className="text-muted-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-warm-ivory font-medium mb-1">
                      Protocol & Next Steps:
                    </p>
                    {createdConsultation.status === 'PAYMENT_SUCCESS' ? (
                      <>
                        <p className="text-ivory-muted">
                          1. Your private styling concierge will contact you via email or WhatsApp within one business day with open calendar slots.
                        </p>
                        <p className="text-ivory-muted">
                          2. You will receive your digital pre-consultation intake questionnaire to upload wardrobe references and lifestyle context.
                        </p>
                        <p className="text-ivory-muted">
                          3. Your personalised STYLEORA Blueprint will be curated and delivered following your 1:1 session.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-ivory-muted">
                          1. Complete secure payment below via Razorpay Standard Checkout to confirm your reservation.
                        </p>
                        <p className="text-ivory-muted">
                          2. Immediately upon confirmation, your dedicated concierge will coordinate your private appointment slot.
                        </p>
                        <p className="text-ivory-muted">
                          3. All transactions are securely protected by 256-bit encryption.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {createdConsultation.status === 'PAYMENT_SUCCESS' ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      to={ROUTES.HOME}
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Return to Atelier Home
                    </Button>
                    <Button
                      onClick={handleResetForm}
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Register Another Consultation
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                      <Button
                        onClick={handleInitiatePayment}
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto flex items-center justify-center gap-2.5"
                        disabled={isPaying || isVerifying}
                      >
                        {isPaying || isVerifying ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>{isVerifying ? 'Verifying Payment...' : 'Connecting to Gateway...'}</span>
                          </>
                        ) : (
                          <>
                            <Lock size={16} />
                            <span>
                              Proceed to Secure Checkout ({createdConsultation.total_price_formatted || createdConsultation.package_price})
                            </span>
                          </>
                        )}
                      </Button>
                      <Button
                        to={ROUTES.HOME}
                        variant="secondary"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        Return to Atelier Home
                      </Button>
                    </div>
                    <button
                      onClick={handleResetForm}
                      className="text-xs text-stone hover:text-champagne transition-colors mt-2 underline-offset-4 hover:underline"
                      type="button"
                    >
                      Register Another Consultation
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* DEFAULT STATE: CORE PACKAGE + OPTIONAL ADD-ONS + RESERVATION FORM        */
            /* ========================================================================= */
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto mb-14">
                <SectionHeading
                  eyebrow="Begin Your Style Journey"
                  title="Reserve Your Consultation."
                  subtitle="Start with your Signature Blueprint — a considered personal styling experience created around you."
                />
              </div>

              {/* STEP 1: Core Package Hero Card */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-cinzel text-xs text-muted-gold tracking-widest uppercase">
                    STEP 01 // YOUR STYLEORA EXPERIENCE
                  </span>
                  <div className="h-px bg-border-subtle flex-1" />
                </div>

                <div className="bg-charcoal border-2 border-champagne p-6 sm:p-10 relative shadow-elevated">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6 pb-6 border-b border-border-subtle">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-cinzel text-[0.65rem] text-muted-gold tracking-widest uppercase">
                          {corePackage.tier}
                        </span>
                        <span className="text-xs text-stone">•</span>
                        <span className="text-xs text-stone">{corePackage.duration}</span>
                      </div>
                      <h3 className="font-editorial text-2xl sm:text-3xl text-warm-ivory font-normal mb-2">
                        {corePackage.name}
                      </h3>
                      <p className="text-ivory-muted text-xs sm:text-sm font-light leading-relaxed max-w-xl">
                        {corePackage.desc}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="font-editorial text-3xl sm:text-4xl text-champagne font-normal block">
                        {corePackage.price}
                      </span>
                      <span className="text-[0.68rem] text-stone">
                        Core Experience • Preselected
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.68rem] tracking-editorial-ultra text-muted-gold uppercase font-medium mb-3">
                      Included In Your Blueprint:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {corePackage.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2 text-xs text-ivory-muted font-light">
                          <Check size={14} className="text-muted-gold shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Optional Add-ons Selection */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-cinzel text-xs text-muted-gold tracking-widest uppercase">
                    STEP 02 // ENHANCE YOUR EXPERIENCE (OPTIONAL)
                  </span>
                  <div className="h-px bg-border-subtle flex-1" />
                </div>
                <p className="text-xs text-stone mb-6 font-light">
                  Choose any optional add-ons that would be useful to you. You can select none, one, or multiple.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {ADD_ONS.map((addon) => {
                    const isSelected = selectedAddOnIds.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddOn(addon.id)}
                        className={`p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-charcoal border-2 border-champagne shadow-elevated'
                            : 'bg-charcoal/60 border border-border-subtle hover:border-border-medium'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[0.62rem] tracking-editorial-ultra text-muted-gold uppercase font-semibold">
                              Optional Add-on
                            </span>
                            <span className="font-editorial text-lg text-champagne font-normal">
                              +{addon.price}
                            </span>
                          </div>

                          <h4 className="font-editorial text-xl text-warm-ivory font-normal mb-1">
                            {addon.name}
                          </h4>

                          <p className="text-[0.7rem] text-champagne/80 font-serif italic mb-2">
                            "{addon.tagline}"
                          </p>

                          <p className="text-ivory-muted text-xs font-light leading-relaxed mb-4">
                            {addon.desc}
                          </p>

                          {addon.notice && (
                            <p className="text-[0.65rem] text-stone leading-relaxed border-t border-border-subtle/50 pt-2 mb-4 italic">
                              <Info size={11} className="inline mr-1 text-muted-gold" />
                              {addon.notice}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-border-subtle/40 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-champagne border-champagne text-obsidian'
                                  : 'border-border-medium'
                              }`}
                            >
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className={isSelected ? 'text-champagne font-medium' : 'text-stone'}>
                              {isSelected ? 'Selected' : 'Add to reservation'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: Client Profile Reservation Form */}
              <div className="bg-charcoal border border-border-subtle p-8 sm:p-12 mb-16 shadow-ambient">
                <div className="flex items-center gap-3 mb-8">
                  <span className="font-cinzel text-xs text-muted-gold tracking-widest uppercase">
                    STEP 03 // CLIENT STYLING DOSSIER & PROFILE
                  </span>
                  <div className="h-px bg-border-subtle flex-1" />
                </div>

                {/* Server Error Alert Banner */}
                {serverError && (
                  <div className="p-4 mb-6 bg-atelier-error/10 border border-atelier-error/40 text-atelier-error text-xs leading-relaxed flex items-start gap-3">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-0.5">Registration Error</p>
                      <p>{serverError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Selected Investment Summary Bar */}
                  <div className="p-5 bg-surface-subtle border border-border-subtle text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border-subtle/60">
                      <div>
                        <span className="text-stone uppercase tracking-editorial-wide block text-[0.68rem]">
                          Core Package:
                        </span>
                        <span className="font-editorial text-lg text-warm-ivory font-normal">
                          {corePackage.name}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-champagne font-editorial text-lg font-normal">
                          {corePackage.price}
                        </span>
                      </div>
                    </div>

                    {selectedAddOns.length > 0 && (
                      <div className="py-2.5 border-b border-border-subtle/60 space-y-1">
                        <span className="text-stone uppercase tracking-editorial-wide block text-[0.65rem] mb-1">
                          Included Add-ons:
                        </span>
                        {selectedAddOns.map((addon) => (
                          <div key={addon.id} className="flex justify-between items-center text-ivory-muted text-xs">
                            <span>+ {addon.name}</span>
                            <span className="text-champagne">{addon.price}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 flex justify-between items-center">
                      <span className="text-stone uppercase tracking-editorial-wide font-medium">
                        Total Reservation Investment:
                      </span>
                      <span className="font-editorial text-2xl text-champagne font-normal">
                        {totalEstimatedFormatted}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs uppercase tracking-editorial-wide text-muted-gold mb-2 font-medium">
                        Full Name <span className="text-atelier-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="customer_name"
                          value={formData.customer_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. Eleanor Vance"
                          className={`w-full bg-obsidian border text-warm-ivory px-4 py-3 pl-10 text-sm focus:outline-none transition-colors ${
                            formErrors.customer_name
                              ? 'border-atelier-error focus:border-atelier-error'
                              : 'border-border-subtle focus:border-champagne'
                          }`}
                        />
                        <User
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone pointer-events-none"
                        />
                      </div>
                      {formErrors.customer_name && (
                        <p className="text-[0.72rem] text-atelier-error mt-1.5 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {formErrors.customer_name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs uppercase tracking-editorial-wide text-muted-gold mb-2 font-medium">
                        Email Address <span className="text-atelier-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. eleanor@vance.luxury"
                          className={`w-full bg-obsidian border text-warm-ivory px-4 py-3 pl-10 text-sm focus:outline-none transition-colors ${
                            formErrors.email
                              ? 'border-atelier-error focus:border-atelier-error'
                              : 'border-border-subtle focus:border-champagne'
                          }`}
                        />
                        <Mail
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone pointer-events-none"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-[0.72rem] text-atelier-error mt-1.5 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs uppercase tracking-editorial-wide text-muted-gold mb-2 font-medium">
                        Phone / WhatsApp <span className="text-atelier-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. +91 98765 43210"
                          className={`w-full bg-obsidian border text-warm-ivory px-4 py-3 pl-10 text-sm focus:outline-none transition-colors ${
                            formErrors.phone
                              ? 'border-atelier-error focus:border-atelier-error'
                              : 'border-border-subtle focus:border-champagne'
                          }`}
                        />
                        <Phone
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone pointer-events-none"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-[0.72rem] text-atelier-error mt-1.5 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Physical / Delivery Address */}
                    <div>
                      <label className="block text-xs uppercase tracking-editorial-wide text-muted-gold mb-2 font-medium">
                        City & Address <span className="text-atelier-error">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="e.g. Mayfair, London / Malabar Hill, Mumbai"
                          className={`w-full bg-obsidian border text-warm-ivory px-4 py-3 pl-10 text-sm focus:outline-none transition-colors ${
                            formErrors.address
                              ? 'border-atelier-error focus:border-atelier-error'
                              : 'border-border-subtle focus:border-champagne'
                          }`}
                        />
                        <MapPin
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-stone pointer-events-none"
                        />
                      </div>
                      {formErrors.address && (
                        <p className="text-[0.72rem] text-atelier-error mt-1.5 flex items-center gap-1">
                          <AlertCircle size={12} />
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Style Objectives & Special Requests */}
                  <div>
                    <label className="block text-xs uppercase tracking-editorial-wide text-muted-gold mb-2 font-medium">
                      Style Objectives / Focus Areas (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        name="style_notes"
                        rows={4}
                        value={formData.style_notes}
                        onChange={handleChange}
                        placeholder="Tell us about upcoming occasions, wardrobe challenges, current silhouettes you love or want to avoid..."
                        className="w-full bg-obsidian border border-border-subtle text-warm-ivory px-4 py-3 pl-10 text-sm focus:outline-none focus:border-champagne transition-colors resize-none"
                      />
                      <FileText
                        size={16}
                        className="absolute left-3 top-4 text-stone pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Submission Agreement Notice */}
                  <div className="pt-2 text-[0.72rem] text-stone leading-relaxed flex items-start gap-2">
                    <Shield size={14} className="text-muted-gold shrink-0 mt-0.5" />
                    <span>
                      By submitting this reservation, your request is logged into our private ledger.
                      Appointment slots are confirmed mutually before any payment is requested.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full py-4 text-sm font-semibold tracking-editorial-wide"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Registering Reservation...
                        </span>
                      ) : (
                        `Reserve Consultation Request (${totalEstimatedFormatted})`
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </AtelierContainer>
      </div>
    </>
  );
};
