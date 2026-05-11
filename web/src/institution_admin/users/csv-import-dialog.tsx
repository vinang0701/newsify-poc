import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, X, Download } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/components/auth-provider";
import { useQueryClient } from "@tanstack/react-query";

interface ImportResult {
    success: { name: string; email: string; role: string; password: string }[];
    failed: { row: any; errors: string[] }[];
}

interface RemoveResult {
    success: { email: string }[];
    failed: { email: string; errors: string[] }[];
}

interface CsvImportDialogProps {
    open: boolean;
    onClose: () => void;
    mode: "import" | "remove";
    queryKey: string;
}

const CsvImportDialog = ({ open, onClose, mode, queryKey }: CsvImportDialogProps) => {
    const { user } = useAuth();
    const inst_id = user?.inst_id ?? "";
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | RemoveResult | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && selected.name.endsWith(".csv")) {
            setFile(selected);
            setResult(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const endpoint = mode === "import"
                ? `/${inst_id}/admin/users/import`
                : `/${inst_id}/admin/users/remove`;

            const res = await api.post(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setResult(res.data);
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        } catch (err) {
            console.error("CSV upload failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        onClose();
    };

    // Download sample CSV
    const downloadSample = () => {
        const content = mode === "import"
            ? "name,email,role\nJohn Doe,john@example.com,student\nJane Smith,jane@example.com,staff"
            : "email\njohn@example.com\njane@example.com";
        const blob = new Blob([content], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = mode === "import" ? "import_sample.csv" : "remove_sample.csv";
        a.click();
    };

    const importResult = result as ImportResult;
    const removeResult = result as RemoveResult;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "import" ? "Import Users via CSV" : "Remove Users via CSV"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "import"
                            ? "Upload a CSV file with columns: name, email, role. Users will receive a welcome email with their login details."
                            : "Upload a CSV file with column: email. Users will be permanently removed."}
                    </DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="flex flex-col gap-4">
                        {/* Sample CSV download */}
                        <Button
                            variant="outline"
                            className="w-fit flex flex-row items-center gap-2 text-sm"
                            onClick={downloadSample}
                        >
                            <Download size={16} />
                            Download Sample CSV
                        </Button>

                        {/* File upload area */}
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={32} className="text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Click to upload a CSV file
                            </p>
                            {file && (
                                <div className="flex flex-row items-center gap-2 text-sm text-primary">
                                    <FileText size={16} />
                                    {file.name}
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    // Results summary
                    <div className="flex flex-col gap-4">
                        {/* Success summary */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex flex-row items-center gap-2 font-semibold text-green-700 mb-2">
                                <Check size={16} />
                                {mode === "import"
                                    ? `${importResult.success?.length ?? 0} users imported successfully`
                                    : `${removeResult.success?.length ?? 0} users removed successfully`}
                            </div>
                            {mode === "import" && importResult.success?.length > 0 && (
                                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                                    {importResult.success.map((u, i) => (
                                        <div key={i} className="text-xs text-green-600 font-mono bg-green-100 px-2 py-1 rounded">
                                            {u.name} | {u.email} | {u.role} | Password: {u.password}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Failed summary */}
                        {(mode === "import" ? importResult.failed : removeResult.failed)?.length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex flex-row items-center gap-2 font-semibold text-red-700 mb-2">
                                    <X size={16} />
                                    {mode === "import"
                                        ? `${importResult.failed?.length ?? 0} rows failed`
                                        : `${removeResult.failed?.length ?? 0} rows failed`}
                                </div>
                                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                                    {mode === "import"
                                        ? importResult.failed?.map((f, i) => (
                                            <div key={i} className="text-xs bg-red-100 px-2 py-1 rounded">
                                                <span className="font-mono text-red-600">
                                                    {f.row.name} | {f.row.email} | {f.row.role}
                                                </span>
                                                <span className="text-red-500 ml-2">→ {f.errors.join(", ")}</span>
                                            </div>
                                        ))
                                        : removeResult.failed?.map((f, i) => (
                                            <div key={i} className="text-xs bg-red-100 px-2 py-1 rounded">
                                                <span className="font-mono text-red-600">{f.email}</span>
                                                <span className="text-red-500 ml-2">→ {f.errors.join(", ")}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={handleClose}>
                            {result ? "Close" : "Cancel"}
                        </Button>
                    </DialogClose>
                    {!result && (
                        <Button
                            onClick={handleSubmit}
                            disabled={!file || loading}
                            className={mode === "remove" ? "bg-destructive hover:bg-destructive/80 text-white" : ""}
                        >
                            {loading
                                ? "Processing..."
                                : mode === "import"
                                ? "Import"
                                : "Remove"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CsvImportDialog;