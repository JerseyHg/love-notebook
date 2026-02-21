"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, UserPlus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Step = "register" | "pair";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("register");
  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    togetherDate: "",
    inviteCode: "",
  });
  const [myInviteCode, setMyInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nickname: form.nickname,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      setMyInviteCode(data.inviteCode || "");
      setStep("pair");
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePair = async (mode: "create" | "join") => {
    setError("");
    setLoading(true);

    try {
      const body =
        mode === "create"
          ? { mode: "create", togetherDate: form.togetherDate }
          : { mode: "join", inviteCode: form.inviteCode };

      const res = await fetch("/api/auth/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "配对失败");
        return;
      }

      if (mode === "create" && data.inviteCode) {
        setMyInviteCode(data.inviteCode);
      }

      router.push("/timeline");
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 bg-gradient-to-b from-pink-50 to-rose-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg mb-4">
            <Heart size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {step === "register" ? "创建账号" : "情侣配对"}
          </h1>
        </div>

        {step === "register" ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="昵称"
              placeholder="你的昵称"
              value={form.nickname}
              onChange={(e) => update("nickname", e.target.value)}
              required
            />
            <Input
              label="邮箱"
              type="email"
              placeholder="请输入邮箱"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
            <Input
              label="密码"
              type="password"
              placeholder="至少 6 位密码"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              minLength={6}
              required
            />

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              注册
            </Button>

            <p className="text-center text-sm text-gray-500">
              已有账号？{" "}
              <Link href="/login" className="text-pink-500 hover:text-pink-600 font-medium">
                去登录
              </Link>
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-sm text-gray-600">
              注册成功！现在选择配对方式：
            </p>

            {/* 创建情侣空间 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-pink-500 font-medium">
                <UserPlus size={18} />
                <span>创建情侣空间</span>
              </div>
              <Input
                label="在一起的日期"
                type="date"
                value={form.togetherDate}
                onChange={(e) => update("togetherDate", e.target.value)}
              />
              <Button
                onClick={() => handlePair("create")}
                loading={loading}
                className="w-full"
                disabled={!form.togetherDate}
              >
                创建并生成邀请码
              </Button>
              {myInviteCode && (
                <div className="text-center p-3 bg-pink-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">你的邀请码</p>
                  <p className="text-2xl font-bold text-pink-500 tracking-widest">
                    {myInviteCode}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    把邀请码发给 TA，一起加入吧
                  </p>
                </div>
              )}
            </div>

            {/* 加入已有空间 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-rose-500 font-medium">
                <Users size={18} />
                <span>加入 TA 的空间</span>
              </div>
              <Input
                label="邀请码"
                placeholder="输入对方的 6 位邀请码"
                value={form.inviteCode}
                onChange={(e) => update("inviteCode", e.target.value.toUpperCase())}
                maxLength={6}
              />
              <Button
                onClick={() => handlePair("join")}
                loading={loading}
                variant="secondary"
                className="w-full"
                disabled={form.inviteCode.length < 6}
              >
                加入
              </Button>
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
}
