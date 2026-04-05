"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a0f0a]" dir="rtl">
      
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden bg-brown-gradient text-white text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block px-4 py-1 border border-white/30 rounded-full text-xs mb-10 font-light tracking-widest uppercase">قصتنا ورسالتنا</span>
          <h1 className="text-6xl md:text-9xl font-bold font-art mb-8 tracking-tighter">
            أثر <span className="opacity-40 font-light mx-4 text-5xl md:text-7xl">|</span> Athar
          </h1>
          <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90 max-w-3xl mx-auto">
            نحن الجسر الذي يصل بين الفن الفلسطيني الأصيل والعالم، نؤمن بأن كل عمل فني يحمل حكاية صمود وإبداع.
          </p>
        </motion.div>
      </section>

      {/* Why Athar Section */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#8a7264] text-sm font-bold uppercase tracking-widest mb-6 block">مهمتنا</span>
            <h2 className="text-4xl md:text-6xl font-bold font-art mb-12 text-[#2c1e15]">لماذا أطلقنا منصة أثر؟</h2>
            <div className="space-y-8 text-xl leading-loose text-gray-700 font-light text-justify md:text-center max-w-4xl mx-auto">
              <p>
                ولدت منصة <span className="font-bold text-[#4a3728]">"أثر"</span> لسد الفجوة بين الفنانين الفلسطينيين الموهوبين وبين متذوقي الفن حول العالم. نحن نؤمن بأن الفن ليس مجرد لوحة أو قطعة حرفية، بل هو وسيلة للتعبير عن الهوية الثقافية والحفاظ على التراث العريق.
              </p>
              <p>
                توفر منصتنا للفنانين المبدعين الأدوات اللازمة لعرض أعمالهم وإدارتها والوصول إلى جمهور عالمي يقدر القيمة الفنية والمعنوية لما يصنعون. كل قطعة تقتنيها من "أثر" لا تدعم الفنان مادياً فحسب، بل تساهم في بقاء الفن الفلسطيني حياً في قلوب البيوت حول العالم.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-6 bg-[#f2f0eb]">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-[#8a7264] text-sm font-bold uppercase tracking-widest mb-6 block">القيم الجوهرية</span>
          <h2 className="text-4xl md:text-6xl font-bold font-art mb-20 text-[#2c1e15]">ما نؤمن به ونلتزم به</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "دعم الفنان أولاً",
                desc: "نحن نضع مصلحة الفنان في قلب منصتنا، موفرين له بيئة احترافية لعرض إبداعاته بأفضل صورة ممكنة.",
                icon: "fa-signature"
              },
              {
                title: "الأصالة والجودة",
                desc: "نحن مهتمون فقط بالفن الحقيقي الأصيل. كل قطعة لدينا تمر بمراجعة دقيقة لضمان أعلى معايير الجودة.",
                icon: "fa-scroll"
              },
              {
                title: "التمكين الاقتصادي",
                desc: "نهدف إلى تمكين الفنانين من تحقيق عائد مادي عادل يدعم استمراريتهم وصمودهم وإبداعهم.",
                icon: "fa-leaf"
              }
            ].map((value, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
              >
                <div className="w-20 h-20 bg-[#faf9f6] rounded-3xl flex items-center justify-center mb-10 mx-auto group-hover:bg-brown-gradient group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                  <i className={`fa-solid ${value.icon} text-3xl`}></i>
                </div>
                <h3 className="text-3xl font-bold font-art mb-6 text-[#1a0f0a]">{value.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed text-lg">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
