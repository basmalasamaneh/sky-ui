import { buildBackendApiUrl } from '@/lib/backend-api';
import { normalizeUserData } from '@/lib/normalize-user';

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, confirmPassword } = body;

    // 1. Basic Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return Response.json(
        { status: 'error', message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    try {
      const backendResponse = await fetch(buildBackendApiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword
        }),
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        // Return structured errors from backend (e.g., validation or duplicate email)
        return Response.json(
          { 
            status: 'error', 
            message: result.message || 'فشل التحقق من البيانات',
            errors: result.errors 
          },
          { status: backendResponse.status }
        );
      }

      // Success - Map snake_case to camelCase for the frontend
      const responseUser = normalizeUserData(result.data?.user);

      return Response.json({
        ...result,
        data: {
          ...result.data,
          user: responseUser
        }
      }, { status: 201 });

    } catch (fetchError) {
      console.error('Backend Connection Error:', fetchError);
      return Response.json(
        { 
          status: 'error', 
          message: 'تعذر إنشاء الحساب حالياً. حاول مرة أخرى لاحقاً.' 
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Signup Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}
