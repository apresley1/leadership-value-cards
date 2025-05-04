import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  steps: string[];
  onStepClick: (step: string) => void;
}

const Stepper = ({ currentStep, steps, onStepClick }: StepperProps) => {
  return (
    <div className="">
      <div className="flex justify-between items-center mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "stepper-item flex flex-col h-20 items-center w-full",
              { "completed": index <= currentStep }
            )}
          >
            <div
              onClick={() => {
                if (index < currentStep) {
                  onStepClick(step);
                }
              }}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full text-sm",
                index <= currentStep ? "bg-blue-500 text-white cursor-pointer" : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <div className="text-xs mt-1 text-center">{step}</div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .stepper-item {
          position: relative;
        }
        
        .stepper-item:not(:last-child):after {
          content: '';
          position: absolute;
          top: 15px;
          left: calc(50% + 20px);
          width: calc(100% - 40px);
          height: 2px;
          background-color: #e2e8f0;
        }
        
        .stepper-item.completed:not(:last-child):after {
          background-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default Stepper;
