import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Zap,
  Code2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";

interface StepContent {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  detail: React.ReactNode;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Danh sách các bước Hướng dẫn / Thiết lập
  const steps: StepContent[] = [
    {
      title: "Quản lý Chat & Ticket tập trung",
      subtitle: "Tối ưu hóa luồng làm việc của đội ngũ hỗ trợ",
      icon: <Bot className="w-8 h-8 text-blue-600" />,
      detail: (
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
          <p>
            Mọi tin nhắn từ Website Widget, Facebook, Zalo sẽ được gom tự động
            về một hộp thư duy nhất.
          </p>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3 text-blue-800">
            <Sparkles className="w-5 h-5 shrink-0 text-blue-600" />
            <span>
              AI sẽ tự động tóm tắt nội dung ticket và đề xuất câu trả lời cho
              Agent.
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Cấu hình AI Agent thông minh",
      subtitle: "Nạp dữ liệu Knowledge Base để Bot tự trả lời",
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      detail: (
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
          <p>
            Bạn có thể tải lên các file PDF, tài liệu hướng dẫn hoặc đường dẫn
            Website.
          </p>
          <p>
            Bot sẽ học từ dữ liệu này và giải đáp các thắc mắc thường gặp của
            khách hàng 24/7 hoàn toàn tự động.
          </p>
        </div>
      ),
    },
    {
      title: "Sẵn sàng tích hợp lên Website!",
      subtitle: "Chỉ một dòng code duy nhất để bắt đầu",
      icon: <Code2 className="w-8 h-8 text-emerald-600" />,
      detail: (
        <div className="space-y-3 text-slate-600 text-xs leading-relaxed">
          <p>
            Bước tiếp theo, chúng tôi sẽ đưa bạn đến trang **Workspace
            Settings** để lấy mã Script nhúng vào Website của bạn.
          </p>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 font-medium">
            ✔ Bạn đã hoàn tất tìm hiểu các tính năng cốt lõi!
          </div>
        </div>
      ),
    },
  ];

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Đánh dấu đã xem xong onboarding (lưu vào LocalStorage hoặc gọi API)
      localStorage.setItem("has_completed_onboarding", "true");
      // Chuyển sang trang Settings
      navigate("/workspace-settings");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-between p-6 sm:p-12 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
            SF
          </div>
          <span className="font-bold text-base tracking-tight">
            SupportFlow
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Bước {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Center Card */}
      <div className="max-w-xl mx-auto w-full bg-white text-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl z-10 my-auto space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Icon Header */}
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          {steps[currentStep].icon}
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {steps[currentStep].title}
          </h2>
          <p className="text-xs text-slate-500">
            {steps[currentStep].subtitle}
          </p>
        </div>

        {/* Step Content Details */}
        <div className="pt-2">{steps[currentStep].detail}</div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentStep === 0
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <Button
            onClick={handleNext}
            className={`flex items-center gap-2 ${
              isLastStep ? "bg-emerald-600 hover:bg-emerald-700" : ""
            }`}
          >
            {isLastStep ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Hoàn tất & Đến Cấu Hình</span>
              </>
            ) : (
              <>
                <span>Tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bottom info */}
      <div className="text-center text-xs text-slate-500 z-10">
        Cần hỗ trợ trong quá trình cài đặt? Liên hệ{" "}
        <a
          href="mailto:support@supportflow.com"
          className="text-blue-400 hover:underline"
        >
          support@supportflow.com
        </a>
      </div>
    </div>
  );
}
