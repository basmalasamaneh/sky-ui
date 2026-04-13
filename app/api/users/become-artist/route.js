import { buildBackendApiUrl } from '@/lib/backend-api';

const mapBackendErrorMessageToArabic = (message) => {
  if (!message) return 'فشل الانضمام كفنان';
  if (String(message).toLowerCase().includes('artist name is already in use')) {
    return 'اسم الفنان مستخدم بالفعل. اختر اسماً فنياً آخر.';
  }
  return message;
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
      const backendResponse = await fetch(buildBackendApiUrl('/api/users/profile'), {
        method: 'PATCH',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      let result;
      const contentType = backendResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await backendResponse.json();
      } else {
        const text = await backendResponse.text();
        throw new Error(text || 'Backend returned an invalid response');
      }

      if (!backendResponse.ok) {
        return Response.json(
          { status: 'error', message: mapBackendErrorMessageToArabic(result?.message) },
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
