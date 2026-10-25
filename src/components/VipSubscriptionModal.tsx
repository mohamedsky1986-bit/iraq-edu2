/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Crown, CheckCircle2, Sparkles, ShieldCheck, CreditCard, Smartphone, Phone, ArrowLeft, Copy, Check } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { soundManager } from '../utils/audioSystem';

interface VipSubscriptionModalProps {
  onClose: () => void;
}

export const VipSubscriptionModal: React.FC<VipSubscriptionModalProps> = ({ onClose }) => {
  const { currentUser, toggleVipStatus, subscriptionPlans, paymentSettings } = useCurriculum();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleActivateDemoVip = () => {
    toggleVipStatus(currentUser.email, true);
    soundManager.playCelebrationFanfare();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch {}
    onClose();
  };

  const handleDeactivateVip = () => {
    toggleVipStatus(currentUser.email, false);
    onClose();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const activePlans = subscriptionPlans.filter(p => p.isActive);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden text-right flex flex-col max-h-[92vh]">
        {/* Top Gold Ribbon Banner */}
        <div className="p-6 bg-linear-to-tr from-amber-600 via-amber-500 to-yellow-400 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-2">
            <Crown className="w-7 h-7 text-white fill-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            اشتراكات وباقات التفوق الوزاري (VIP) - العراق
          </h3>
          <p className="text-xs text-amber-100 font-medium mt-0.5">
            امتحانات شاملة لجميع الأدوار، تصحيح ذكي للفراغات، شروحات فيديو مكثفة، وتفعيل مباشر عبر زين كاش
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Active Plans in IQD */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3">اختر الباقة المناسبة لمرحلتك الدراسية:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-right ${
                    plan.isPopular
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    {plan.isPopular && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md inline-block">
                        الأكثر اختياراً في العراق
                      </span>
                    )}
                    <strong className="text-xs font-bold text-slate-900 block leading-tight">{plan.name}</strong>
                    <div className="font-mono text-base font-black text-slate-900">
                      {plan.priceIQD.toLocaleString('ar-IQ')} <span className="text-xs font-bold text-slate-500">د.ع</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">{plan.durationText}</span>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Iraqi Payment Methods (ZainCash, Qi Card, etc.) */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>طرق الدفع والتحويل المعتمدة في العراق:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* ZainCash */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">محفظة زين كاش (ZainCash):</span>
                  <strong className="font-mono text-emerald-700 text-sm">{paymentSettings.zainCashNumber}</strong>
                  <span className="text-[10px] text-slate-400 block">{paymentSettings.zainCashHolder}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(paymentSettings.zainCashNumber, 'zain')}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                  title="نسخ الرقم"
                >
                  {copiedKey === 'zain' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Qi Card / Master */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">كي كارد / ماستر كارد (Qi Card):</span>
                  <strong className="font-mono text-slate-800 text-xs">{paymentSettings.qiCardNumber}</strong>
                  <span className="text-[10px] text-slate-400 block">تحويل مباشر بين البطاقات</span>
                </div>
                <button
                  onClick={() => copyToClipboard(paymentSettings.qiCardNumber, 'qi')}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                  title="نسخ رقم البطاقة"
                >
                  {copiedKey === 'qi' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-700 text-xs space-y-1">
              <strong className="text-emerald-900 block font-bold">طريقة التفعيل الفوري:</strong>
              <p className="leading-relaxed">{paymentSettings.instructions}</p>
              <div className="pt-1 flex items-center gap-1 font-mono font-bold text-emerald-800">
                <Phone className="w-3.5 h-3.5" />
                <span>واتساب التأكيد والإشعار: {paymentSettings.whatsappContact}</span>
              </div>
            </div>
          </div>

          {/* Current VIP Status & Demo Activation Button */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            {currentUser.isVip ? (
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>حسابك مفعّل فيه اشتراك VIP حالياً!</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500">
                يمكن تفعيل حسابك كـ VIP فور تحويل الاشتراك وتزويدنا برقم الإشعار
              </div>
            )}

            <div className="flex items-center gap-2">
              {currentUser.isVip ? (
                <button
                  onClick={handleDeactivateVip}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold cursor-pointer"
                >
                  إلغاء الاشتراك
                </button>
              ) : (
                <button
                  onClick={handleActivateDemoVip}
                  className="px-5 py-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تفعيل اشتراك VIP تجريبي فوري</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
