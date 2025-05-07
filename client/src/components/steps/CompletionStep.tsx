import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LeadershipValue, UserInfo } from "@/types";
import { CheckCircle, Download, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { generatePDF } from "@/lib/pdf-generator";
import { extractFirstName } from "@/lib/utils";

interface CompletionStepProps {
  coreValues: LeadershipValue[];
  userInfo: UserInfo;
}

// Redirect URL - This could be set from an environment variable or admin settings
const REDIRECT_URL = import.meta.env.VITE_REDIRECT_URL || "https://example.com/leadership-consulting";
const REDIRECT_TIMEOUT = 10; // seconds

const CompletionStep = ({ coreValues, userInfo }: CompletionStepProps) => {
  const [countdown, setCountdown] = useState(REDIRECT_TIMEOUT);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const handleDownloadPDF = () => {
    const pdfBase64 = generatePDF(coreValues, userInfo);
    const firstName = extractFirstName(userInfo.name);
    
    // Convert base64 to binary data using browser APIs
    const binary = atob(pdfBase64.split(',')[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    
    // Create a blob from the binary data
    const blob = new Blob([array], { type: 'application/pdf' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${firstName}_Leadership_Values.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPdfDownloaded(true);

    // Clear stored state from localStorage after PDF is downloaded
    // to reset the process for next time
    try {
      localStorage.removeItem("currentStep");
      localStorage.removeItem("sortedValues");
      localStorage.removeItem("selectedValues");
      localStorage.removeItem("coreValues");
      localStorage.removeItem("userInfo");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  const handleRedirect = () => {
    window.location.href = REDIRECT_URL;
  };

  useEffect(() => {
    if (pdfDownloaded && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (pdfDownloaded && countdown === 0) {
      handleRedirect();
    }
  }, [countdown, pdfDownloaded]);

  // Calculate progress percentage
  const progressPercentage =
    ((REDIRECT_TIMEOUT - countdown) / REDIRECT_TIMEOUT) * 100;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-primary mb-2">Thank You!</h2>
        <p className="text-muted-foreground">
          Your personalized Leadership Values PDF has been generated.
        </p>
      </div>

      <div className="bg-white border border-muted rounded-lg p-8 mb-8">
        <div className="bg-muted/20 p-4 mb-4 rounded-md">
          <h3 className="font-medium text-primary mb-2">
            Your Core Leadership Values
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            These values represent who you are as a leader. Use them to guide
            your decisions and actions.
          </p>

          <div className="space-y-3">
            {coreValues.map((value, index) => (
              <div
                key={value.id}
                className="flex items-center p-3 bg-white rounded-md shadow-sm"
              >
                <div className="min-w-8 w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-500 text-white rounded-full mr-3 font-medium">
                  {index + 1}
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-semibold text-primary">{value.value}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleDownloadPDF}
            className="px-6 inline-flex items-center bg-blue-600 hover:bg-blue-500"
            disabled={pdfDownloaded}
          >
            <Download className="h-5 w-5 mr-2" />
            {pdfDownloaded ? "PDF Downloaded" : "Download PDF"}
          </Button>
        </div>
      </div>

      {pdfDownloaded ? (
        <div className="space-y-4 bg-blue-50 border border-blue-100 rounded-lg p-6">
          <h3 className="font-medium text-blue-800">
            Next Steps for Your Leadership Journey
          </h3>
          <p className="text-sm text-blue-700">
            Thank you for completing the Leadership Values Assessment. You will
            be redirected to our Leadership Consulting resources in:
          </p>

          <div className="my-4">
            <div className="flex justify-between text-sm text-blue-600 mb-2">
              <span>0s</span>
              <span>{countdown}s</span>
              <span>{REDIRECT_TIMEOUT}s</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <Button
            onClick={handleRedirect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Go to Leadership Resources Now
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Want more insights on leadership development?
          </p>
          <a
            href={REDIRECT_URL}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Visit our leadership resources →
          </a>
        </div>
      )}
    </div>
  );
};

export default CompletionStep;
