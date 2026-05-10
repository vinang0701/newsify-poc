import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { Check, Crown, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

//const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

const PLANS = [
    {
        key: "basic",
        name: "Basic",
        price: "$18,000",
        period: "/ year",
        icon: <Zap size={24} className="text-blue-500" />,
        color: "border-blue-200 hover:border-blue-400",
        activeBg: "bg-blue-50",
        buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
        features: [
            "Up to 15,000 users",
            "Up to 100 communities",
            "Content moderation tools",
            "User management",
            "Email support",
        ],
    },
    {
        key: "pro",
        name: "Pro",
        price: "$30,000",
        period: "/ year",
        icon: <Star size={24} className="text-purple-500" />,
        color: "border-purple-200 hover:border-purple-400",
        activeBg: "bg-purple-50",
        buttonClass: "bg-purple-600 hover:bg-purple-700 text-white",
        features: [
            "Up to 20,000 users",
            "Up to 200 communities",
            "Content moderation tools",
            "User management",
            "Priority email support",
            "Analytics dashboard",
        ],
    },
    {
        key: "premium",
        name: "Premium",
        price: "$50,000",
        period: "/ year",
        icon: <Crown size={24} className="text-yellow-500" />,
        color: "border-yellow-200 hover:border-yellow-400",
        activeBg: "bg-yellow-50",
        buttonClass: "bg-yellow-500 hover:bg-yellow-600 text-white",
        features: [
            "Unlimited users",
            "Unlimited communities",
            "Content moderation tools",
            "User management",
            "24/7 priority support",
            "Advanced analytics",
            "Custom integrations",
        ],
    },
];

function titleCase(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const BillingPage = () => {
    const { user } = useAuth();
    const inst_id = user?.inst_id ?? "";
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const success = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");
    const newPlan = searchParams.get("plan");

    // Fetch current plan
    const { data: institution, isLoading } = useQuery({
        queryKey: ["currentPlan", inst_id],
        queryFn: async () => {
            const res = await api.get(`/${inst_id}/admin/billing/current-plan`);
            return res.data;
        },
    });

    const handleSubscribe = async (planKey: string) => {
        setLoading(planKey);
        try {
            const res = await api.post(
                `/${inst_id}/admin/billing/create-checkout-session?plan=${planKey}`
            );
            window.location.href = res.data.url;
        } catch (err) {
            console.error("Checkout failed:", err);
        } finally {
            setLoading(null);
        }
    };

    useEffect(() => {
        const verifyPayment = async () => {
            const sessionId = searchParams.get("session_id");
            const plan = searchParams.get("plan");

            if (success && sessionId && plan) {
                try {
                    await api.post(
                        `/${inst_id}/admin/billing/verify-payment?session_id=${sessionId}&plan=${plan}`
                    );
                    // Refetch current plan
                    queryClient.invalidateQueries({ queryKey: ["currentPlan"] });
                } catch (err) {
                    console.error("Verification failed:", err);
                }
            }
        };
        verifyPayment();
    }, [success]);

    if (isLoading) return <Loading />;

    const currentPlan = institution?.plan?.toLowerCase();


    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="px-4 py-6 text-2xl font-bold border-b border-border">
                Billing & Subscription
            </div>

            <div className="px-4 flex flex-col gap-8">
                {/* Success/Cancel messages */}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        ✅ Payment successful! Your plan has been updated to <strong>{titleCase(newPlan ?? "")}</strong>.
                    </div>
                )}
                {cancelled && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-700">
                        ⚠️ Payment was cancelled. Your current plan remains unchanged.
                    </div>
                )}

                {/* Current Plan Summary */}
                {institution && (
                    <div className="p-6 border border-border rounded-lg bg-card flex flex-row justify-between items-center">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-muted-foreground">Current Plan</p>
                            <p className="text-2xl font-bold">
                                {currentPlan ? titleCase(currentPlan) : "No active plan"}
                            </p>
                            {institution.start_date && (
                                <p className="text-sm text-muted-foreground">
                                    Started: {new Date(institution.start_date).toLocaleDateString()}
                                </p>
                            )}
                            {institution.end_date && (
                                <p className="text-sm text-muted-foreground">
                                    Renews: {new Date(institution.end_date).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                            institution.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                        }`}>
                            {institution.status}
                        </div>
                    </div>
                )}

                {/* Plan Cards */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">
                        {currentPlan ? "Change Your Plan" : "Choose a Plan"}
                    </h2>
                    <div className="grid grid-cols-3 gap-6">
                        {PLANS.map((plan) => {
                            const isCurrentPlan = currentPlan === plan.key;
                            return (
                                <div
                                    key={plan.key}
                                    className={`flex flex-col gap-4 p-6 border-2 rounded-lg transition-colors ${
                                        isCurrentPlan
                                            ? `${plan.color} ${plan.activeBg}`
                                            : "border-border bg-card"
                                    }`}
                                >
                                    {/* Plan Header */}
                                    <div className="flex flex-row justify-between items-center">
                                        <div className="flex flex-row items-center gap-2">
                                            {plan.icon}
                                            <span className="font-bold text-lg">{plan.name}</span>
                                        </div>
                                        {isCurrentPlan && (
                                            <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full font-medium">
                                                Current Plan
                                            </span>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="flex flex-row items-end gap-1">
                                        <span className="text-3xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                                    </div>

                                    {/* Features */}
                                    <div className="flex flex-col gap-2 flex-1">
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex flex-row items-center gap-2">
                                                <Check size={16} className="text-green-500 shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        className={`w-full mt-2 ${
                                            isCurrentPlan
                                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                                : plan.buttonClass
                                        }`}
                                        onClick={() => !isCurrentPlan && handleSubscribe(plan.key)}
                                        disabled={isCurrentPlan || loading === plan.key}
                                    >
                                        {loading === plan.key
                                            ? "Redirecting..."
                                            : isCurrentPlan
                                            ? "Current Plan"
                                            : currentPlan
                                            ? "Switch to this plan"
                                            : "Subscribe"}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Test Mode Notice */}
                <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                    🔒 Payments are processed securely via Stripe. Use test card <strong>4242 4242 4242 4242</strong> with any future expiry date and any CVC to test payments.
                </div>
            </div>
        </div>
    );
};

export default BillingPage;