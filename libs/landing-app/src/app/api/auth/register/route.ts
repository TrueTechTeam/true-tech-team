import { NextResponse } from 'next/server';
import { registerUser } from '../lib/auth/auth-options';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Register the user
    const user = await registerUser(email, password, name);

    return NextResponse.json({ user, message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An error occurred during registration' }, { status: 500 });
  }
}

