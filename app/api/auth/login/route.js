import { buildBackendApiUrl } from '@/lib/backend-api';
import { normalizeUserData } from '@/lib/normalize-user';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { status: 'error', message: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    try {
      const backendResponse = await fetch(buildBackendApiUrl('/api/v1/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        return Response.json(
          {
            status: 'error',
            message: result.message || 'فشل تسجيل الدخول',
            errors: result.errors,
          },
          { status: backendResponse.status }
        );
      }

      const responseUser = normalizeUserData(result.data?.user);

      return Response.json(
        {
          ...result,
          data: {
            ...result.data,
            user: responseUser,
          },
        },
        { status: 200 }
      );
    } catch (fetchError) {
      console.error('Backend Connection Error:', fetchError);
      return Response.json(
        {
          status: 'error',
          message: 'تعذر تسجيل الدخول حالياً. حاول مرة أخرى لاحقاً.',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Login Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}
