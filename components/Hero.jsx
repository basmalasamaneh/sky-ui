import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" dir="rtl">

      {/* النص - يمين */}
      <div className="space-y-6">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-tight tracking-tight">
          من <span className="bg-gradient-to-r from-[#6f370f] via-[#a3785a] to-[#d4af37] bg-clip-text text-transparent">تراثنا</span>
          <br />
          إلى روحك
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          في أثر، كل قطعة تحمل روح صانعها من خطوط الرسم الحرة، إلى دقة الخرز، ونعومة التطريز، وعراقة الفخار
        </p>
        <div className="flex items-center gap-4">
          <Link href="/products" className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            ▶ استعراض
          </Link>
          <Link href="/register" className="px-6 py-3 bg-gradient-to-r from-[#6f370f] via-[#a3785a] to-[#d4af37] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md">
            تسوق الآن
          </Link>
        </div>
      </div>

      {/* الصورة والبطاقات - يسار */}
      <div className="relative group">

        {/* صورة المنتج */}
        <div className="relative rounded-3xl overflow-hidden h-[450px] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
          <Image
            src="/images/painting.jpg"
            alt="لوحة فنية أثر"
            fill
            className="object-cover"
          />
        </div>

        {/* حاوية الإشعارات */}
        <div className="absolute -bottom-8 -right-8 flex flex-col gap-4 z-10">
          
          {/* بطاقة 1 - معلومات الفنان */}
          <div className="bg-white rounded-2xl shadow-xl p-4 w-72 border border-gray-100 transform transition-all duration-300 hover:-translate-x-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-base font-black">
                  ف
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">فنان تشكيلي</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">لوحات فنية جدارية</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-300">الآن</span>
            </div>
            <div className="h-px bg-gray-100 mb-3"></div>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-sm font-black text-gray-900">١٢٠</p>
                <p className="text-xs text-gray-400">عمل فني</p>
              </div>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="text-center">
                <p className="text-sm font-black text-gray-900">٩٩٪</p>
                <p className="text-xs text-gray-400">رضا</p>
              </div>
              <div className="w-px h-8 bg-gray-100"></div>
              <div className="text-center">
                <p className="text-sm font-black text-gray-900">١٥</p>
                <p className="text-xs text-gray-400">سنة خبرة</p>
              </div>
            </div>
          </div>

          {/* بطاقة 2 - تفاصيل المنتج */}
          <div className="bg-white rounded-2xl shadow-xl p-4 w-72 border border-gray-100 transform transition-all duration-300 hover:-translate-x-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">
                🖼️
              </div>
              <div className="text-right flex-1">
                <p className="text-sm font-black text-gray-900">لوحة شجرة فنية مميزة</p>
                <div className="flex items-center justify-end gap-2 mt-0.5">
                  <span className="text-xs font-bold text-amber-500">★ ٥.٠</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs font-black text-primary">١٤٩ ر.س</span>
                </div>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-1 rounded-lg shrink-0">
                متبقٍ ٥
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: '90%' }}></div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400">المبيعات</span>
              <span className="text-xs font-bold text-gray-500">90%</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  )
}
