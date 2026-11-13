import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function POST(request) {
  // Clear any auth cookie/session simulation
  const cookieStore = cookies()
  cookieStore.delete('session')
  redirect('/')
}
