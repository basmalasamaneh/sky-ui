import { buildBackendApiUrl } from '@/lib/backend-api';

const mapBackendErrorMessageToArabic = (message) => {
  if (!message) return 'فشل الانضمام كفنان';
  if (String(message).includes('الاسم الفني مستخدم بالفعل')) {
    return 'اسم الفنان مستخدم بالفعل. اختر اسماً فنياً آخر.';
  }
  if (String(message).toLowerCase().includes('artist name is already in use')) {
    return 'اسم الفنان مستخدم بالفعل. اختر اسماً فنياً آخر.';
  }
  return message;
};

const parseBackendResponse = async (backendResponse) => {
  const contentType = backendResponse.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await backendResponse.json();
  }

  const text = await backendResponse.text();
  return { message: text || 'Backend returned an invalid response' };
};

const patchBackend = async (path, authHeader, body) => {
  const backendResponse = await fetch(buildBackendApiUrl(path), {
    method: 'PATCH',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await parseBackendResponse(backendResponse);
  return { backendResponse, result };
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

    const body = await req.json();

    try {
      const { backendResponse, result } = await patchBackend('/api/users/profile', authHeader, body);

      if (!backendResponse.ok) {
        const mappedErrors = Array.isArray(result?.errors)
          ? result.errors.map((errorItem) => ({
              field: errorItem?.field,
              message: mapBackendErrorMessageToArabic(errorItem?.message),
            }))
          : undefined;

        return Response.json(
          {
            status: 'error',
            message: mapBackendErrorMessageToArabic(result?.message),
            ...(mappedErrors ? { errors: mappedErrors } : {}),
          },
          { status: backendResponse.status }
        );
      }

      return Response.json(result, { status: 200 });
    } catch (fetchError) {
      console.error('Backend Connection Error:', fetchError);
      return Response.json(
        { status: 'error', message: 'تعذر الاتصال بالخادم حالياً. حاول مرة أخرى لاحقاً.' },
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
