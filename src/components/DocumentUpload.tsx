
import React, { useRef, useState } from "react";
import { documentApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

type PrintOption = {
  id: number;
  file: File;
  printType: "single_side" | "double_side";
  colorType: "black_white" | "color";
  price: number;
  pages: number;
  isPaid: boolean;
  paymentLoading: boolean;
};

const DocumentUpload: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [options, setOptions] = useState<PrintOption[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch print prices
  const prices = documentApi.getPrintPrices();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setOptions(
        filesArray.map((file, idx) => ({
          id: Date.now() + idx,
          file,
          printType: "single_side",
          colorType: "black_white",
          price: prices.single_side_bw,
          pages: 1, // default 1, actual page count handled in backend
          isPaid: false,
          paymentLoading: false,
        }))
      );
    }
  };

  // Update print option (single/double, color/bw)
  const handleOptionChange = (
    idx: number,
    field: keyof Omit<PrintOption, "file" | "id" | "price" | "isPaid" | "paymentLoading" | "pages">,
    value: string
  ) => {
    setOptions((prev) =>
      prev.map((o, i) => {
        if (i === idx) {
          let price = getPrice(value === "single_side" || value === "double_side" ? value as any : o.printType, value === "color" || value === "black_white" ? value as any : o.colorType, o.pages);
          return { ...o, [field]: value, price };
        }
        return o;
      })
    );
  };

  function getPrice(printType: "single_side" | "double_side", colorType: "black_white" | "color", pages = 1) {
    let base = 0;
    if (printType === "single_side" && colorType === "black_white") base = prices.single_side_bw;
    else if (printType === "double_side" && colorType === "black_white") base = prices.double_side_bw;
    else if (printType === "single_side" && colorType === "color") base = prices.single_side_color;
    else base = prices.double_side_color;
    return base * pages;
  }

  // Handle upload click
  const handleUpload = async (payNow: boolean) => {
    if (!options.length) return;
    setIsUploading(true);
    for (let idx = 0; idx < options.length; idx++) {
      const o = options[idx];
      // On UI, show pseudo-payment modal if payNow
      if (payNow) {
        setOptions((prev) =>
          prev.map((op, i) => (i === idx ? { ...op, paymentLoading: true } : op))
        );
        await new Promise(res => setTimeout(res, 1200)); // simulate payment
      }
      try {
        await documentApi.uploadDocument(o.file, o.printType, o.colorType, payNow);
        if (payNow) toast.success("Payment successful! Document added to paid queue.");
        else toast.info("Document uploaded! Please be present for printing or pay later.");
      } catch (err) {
        toast.error("Failed to upload " + o.file.name);
      }
      setOptions((prev) =>
        prev.map((op, i) => (i === idx ? { ...op, paymentLoading: false } : op))
      );
    }
    setOptions([]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!user) {
    return (
      <div className="text-gray-500 text-center py-8">
        Please log in to upload your documents.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Upload your documents</h2>
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="mb-3"
      />

      <div className="space-y-5">
        {options.map((opt, idx) => (
          <div key={opt.id} className="bg-gray-50 rounded-md p-4 mb-2 border">
            <div className="flex flex-col md:flex-row md:items-center md:gap-8">
              <span className="font-medium flex-1">{opt.file.name}</span>
              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="text-xs block mb-1">Print Side</label>
                  <RadioGroup
                    defaultValue={opt.printType}
                    onValueChange={v => handleOptionChange(idx, "printType", v)}
                    className="flex gap-2"
                  >
                    <RadioGroupItem value="single_side" checked={opt.printType === "single_side"} id={"side-1" + idx} />
                    <label htmlFor={"side-1" + idx} className="mr-2">Single</label>
                    <RadioGroupItem value="double_side" checked={opt.printType === "double_side"} id={"side-2" + idx} />
                    <label htmlFor={"side-2" + idx}>Double</label>
                  </RadioGroup>
                </div>
                <div>
                  <label className="text-xs block mb-1">Colour</label>
                  <RadioGroup
                    defaultValue={opt.colorType}
                    onValueChange={v => handleOptionChange(idx, "colorType", v)}
                    className="flex gap-2"
                  >
                    <RadioGroupItem value="black_white" checked={opt.colorType === "black_white"} id={"bw" + idx} />
                    <label htmlFor={"bw" + idx} className="mr-2">B&W</label>
                    <RadioGroupItem value="color" checked={opt.colorType === "color"} id={"color" + idx} />
                    <label htmlFor={"color" + idx}>Colour</label>
                  </RadioGroup>
                </div>
                <div>
                  <label className="text-xs block mb-1">Pages</label>
                  <Input
                    type="number"
                    min={1}
                    defaultValue={1}
                    value={opt.pages}
                    onChange={e => {
                      const val = Math.max(1, Number(e.target.value) || 1);
                      setOptions(prev =>
                        prev.map((op, i) =>
                          i === idx ? { ...op, pages: val, price: getPrice(op.printType, op.colorType, val) } : op
                        )
                      );
                    }}
                    className="w-16"
                  />
                </div>
                <div>
                  <span className="block mb-1 text-xs">Total</span>
                  <span className="font-semibold text-primary">₹{opt.price / 100}</span>
                </div>
              </div>
            </div>
            {opt.paymentLoading && (
              <div className="flex items-center gap-2 mt-3 text-green-600 text-sm">
                <Loader2 className="animate-spin h-4 w-4" />
                Processing Payment...
              </div>
            )}
          </div>
        ))}
      </div>

      {options.length > 0 && (
        <div className="flex flex-col md:flex-row gap-2 mt-5">
          <Button
            type="button"
            disabled={isUploading}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700"
            onClick={() => handleUpload(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Pay Now (GPay)
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            className="w-full md:w-auto"
            onClick={() => handleUpload(false)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Pay at Counter (Physical collect)
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
