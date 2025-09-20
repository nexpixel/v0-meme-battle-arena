"use server"

export async function getOnchainKitConfig() {
  // OnchainKit API keys are designed to be public and safe for client-side use
  // Moving to server action to avoid deployment warnings about sensitive variables
  return {
    apiKey: process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || "",
  }
}
