import { buildBackendApiUrl } from '@/lib/backend-api';
import { normalizeUserData } from '@/lib/normalize-user';

const mapBackendErrorMessageToArabic = (message) => {
  if (!message) return 'فشل تحديث البيانات';
  if (String(message).includes('الاسم الفني مستخدم بالفعل')) {
    return 'اسم الفنان مستخدم بالفعل. اختر اسماً فنياً آخر.';
  }
  if (String(message).toLowerCase().includes('artist name is already in use')) {
    return 'اسم الفنان مستخدم بالفعل. اختر اسماً فنياً آخر.';
  }
  return message;
};

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { status: 'error', message: 'غير مصرح. يرجى تسجيل الدخول مجدداً.' },
        { status: 401 }
      );
    }

    try {
      const backendResponse = await fetch(buildBackendApiUrl('/api/v1/users/profile'), {
        method: 'GET',
        headers: { 'Authorization': authHeader },
      });

      const result = await backendResponse.json();

      if (!backendResponse.ok) {
        return Response.json(
          { status: 'error', message: result.message || 'فشل جلب الملف الشخصي' },
          { status: backendResponse.status }
        );
      }

      return Response.json(
        { status: 'success', data: { user: normalizeUserData(result.data?.user) } },
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
    console.error('Get Profile Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}


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
      const backendResponse = await fetch(buildBackendApiUrl('/api/v1/users/profile'), {
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
        const mappedErrors = Array.isArray(result?.errors)
          ? result.errors.map((errorItem) => ({
              field: errorItem?.field,
              message: mapBackendErrorMessageToArabic(errorItem?.message),
            }))
          : undefined;

        return Response.json(
          {
            status: 'error',
            message: mapBackendErrorMessageToArabic(result?.message) || 'فشل تحديث البيانات',
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
    console.error('Update Profile Route Error:', error);
    return Response.json(
      { status: 'error', message: 'حدث خطأ غير متوقع في الخادم' },
      { status: 500 }
    );
  }
}
