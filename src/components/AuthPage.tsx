'use client'

import { useState, useEffect } from 'react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/firebase/firebaseUtils'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useAuth } from '../lib/hooks/useAuth'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { user } = useAuth()

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
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-[350px] bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Welcome to Mind Memo</CardTitle>
          <CardDescription className="text-gray-400">Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="signin" className="text-white data-[state=active]:bg-gray-600">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-white data-[state=active]:bg-gray-600">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email or Phone Number</Label>
                  <Input id="email" type="text" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-700 text-white" />
                </div>
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">Sign In</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email or Phone Number</Label>
                  <Input id="signup-email" type="text" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-700 text-white" />
                </div>
                <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">Sign Up</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button variant="outline" className="w-full mb-2 bg-gray-700 text-white hover:bg-gray-600" onClick={handleGoogleSignIn}>
            Sign in with Google
          </Button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardFooter>
      </Card>
    </div>
  )
}