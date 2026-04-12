import { buildBackendApiUrl } from '@/lib/backend-api';
import { normalizeUserData } from '@/lib/normalize-user';

export async function PATCH(req) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { status: 'error', message: 'غير مصرح. يرجى تسجيل الدخول مجدداً.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    try {
      const backendResponse = await fetch(buildBackendApiUrl('/api/users/become-artist'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(body),
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        return Response.json(
          {
            status: 'error',
            message: result.message || 'تعذر إرسال طلب الفنان حالياً.',
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
        { status: 'error', message: 'تعذر إرسال الطلب حالياً. حاول مرة أخرى لاحقاً.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Become Artist Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}