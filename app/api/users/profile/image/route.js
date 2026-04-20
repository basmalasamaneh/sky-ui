import { buildBackendApiUrl } from '@/lib/backend-api';
import { normalizeUserData } from '@/lib/normalize-user';

const parseBackendResponse = async (backendResponse) => {
  const contentType = backendResponse.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await backendResponse.json();
  }

  const text = await backendResponse.text();
  return { message: text || 'Backend returned an invalid response' };
};

export async function PATCH(req) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { status: 'error', message: 'غير مصرح. يرجى تسجيل الدخول مجدداً.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    try {
      const backendResponse = await fetch(buildBackendApiUrl('/api/users/profile/image'), {
        method: 'PATCH',
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      });

      const result = await parseBackendResponse(backendResponse);

      if (!backendResponse.ok) {
        return Response.json(
          {
            status: 'error',
            message: result?.message || 'تعذر تحديث الصورة الشخصية حالياً.',
            ...(Array.isArray(result?.errors) ? { errors: result.errors } : {}),
          },
          { status: backendResponse.status }
        );
      }

      return Response.json(
        {
          ...result,
          data: {
            ...result?.data,
            user: normalizeUserData(result?.data?.user),
          },
        },
        { status: 200 }
      );
    } catch (fetchError) {
      console.error('Backend Connection Error:', fetchError);
      return Response.json(
        { status: 'error', message: 'تعذر الاتصال بالخادم حالياً. حاول مرة أخرى لاحقاً.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Profile Image Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}