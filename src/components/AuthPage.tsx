'use client'

import { useState } from 'react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/firebase/firebaseUtils'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useAuth } from '../lib/hooks/useAuth'

const translations = {
  en: {
    welcome: "Welcome to Mind Memo",
    signInOrCreate: "Sign in or create an account",
    email: "Email or Phone Number",
    password: "Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    signInWithGoogle: "Sign in with Google",
    selectLanguage: "Select Language",
  },
  'zh-CN': {
    welcome: "欢迎使用 Mind Memo",
    signInOrCreate: "登录或创建账户",
    email: "邮箱或电话号码",
    password: "密码",
    signIn: "登录",
    signUp: "注册",
    signInWithGoogle: "使用谷歌账号登录",
    selectLanguage: "选择语言",
  },
  'zh-TW': {
    welcome: "歡迎使用 Mind Memo",
    signInOrCreate: "登錄或創建帳戶",
    email: "郵箱或電話號碼",
    password: "密碼",
    signIn: "登錄",
    signUp: "註冊",
    signInWithGoogle: "使用谷歌帳號登錄",
    selectLanguage: "選擇語言",
  },
} as const

type LanguageKey = keyof typeof translations

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [language, setLanguage] = useState<LanguageKey>('en')
  const { user } = useAuth()

  const t = translations[language]

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmail(email, password)
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUpWithEmail(email, password)
    } catch (error) {
      setError((error as Error).message)
    }
  }

  if (user) {
    return null // Don't render anything if the user is already signed in
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-[350px] mb-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageKey)}
          className="w-full p-2 bg-gray-800 text-white rounded-md"
        >
          <option value="en">English</option>
          <option value="zh-CN">简体中文</option>
          <option value="zh-TW">繁體中文</option>
        </select>
      </div>
      <Card className="w-[350px] bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>{t.welcome}</CardTitle>
          <CardDescription className="text-gray-400">{t.signInOrCreate}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="signin" className="text-white data-[state=active]:bg-gray-600">{t.signIn}</TabsTrigger>
              <TabsTrigger value="signup" className="text-white data-[state=active]:bg-gray-600">{t.signUp}</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input id="email" type="text" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-700 text-white" />
                </div>
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">{t.signIn}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t.email}</Label>
                  <Input id="signup-email" type="text" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t.password}</Label>
                  <Input id="signup-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-700 text-white" />
                </div>
                <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">{t.signUp}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button variant="outline" className="w-full mb-2 bg-gray-700 text-white hover:bg-gray-600" onClick={handleGoogleSignIn}>
            {t.signInWithGoogle}
          </Button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardFooter>
      </Card>
    </div>
  )
}