"use client";

import React from 'react';
import { motion } from 'framer-motion';

const creators = [
  {
    name: "بسملة",
    englishName: "Basmala",
    role: "Technical Lead",
    icon: "fa-code",
    gradient: "linear-gradient(135deg, #4a3728 0%, #8a7264 100%)",
    ringColor: "#4a3728",
    desc: "قائدة متميزة جمعت بين الرؤية والتنفيذ. رسمت الخارطة التقنية لمنصة أثر بأكملها، وأشرفت على كل تفصيلة برمجية بنظرة شاملة وعقل مبدع لا يعرف المستحيل.",
  },
  {
    name: "مريم",
    englishName: "Mariam",
    role: "Backend Engineer",
    icon: "fa-server",
    gradient: "linear-gradient(135deg, #2c1e15 0%, #6b4e3d 100%)",
    ringColor: "#2c1e15",
    desc: "معمارية الأنظمة الخفية التي تُحرك المنصة من خلف الكواليس. بنت بنية خلفية متينة تضمن سرعة لا تُبطئ وأمانًا لا يُخترق، وكأنها تُشيد قلعة رقمية لا تُهزم.",
  },
  {
    name: "بتول",
    englishName: "Batool",
    role: "UI/UX Engineer",
    icon: "fa-pen-nib",
    gradient: "linear-gradient(135deg, #6b4e3d 0%, #b08870 100%)",
    ringColor: "#6b4e3d",
    desc: "الروح الجمالية وراء كل ما تراه على الشاشة. مزجت بين الفن الرقمي وتجربة المستخدم بأسلوب يأخذ الأنفاس، لتحوّل كل نقرة إلى لحظة جمال خالص.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0b0b0b] text-[#1a0f0a] dark:text-[#e8dcc4]" dir="rtl">
      
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
            <h2 className="text-4xl md:text-6xl font-bold font-art mb-12 text-[#2c1e15] dark:text-[#e8dcc4]">لماذا أطلقنا منصة أثر؟</h2>
              <div className="space-y-8 text-xl leading-loose text-gray-700 dark:text-[#e8dcc4] font-light text-justify md:text-center max-w-4xl mx-auto">
                <p>
                  في قلب كل فلسطيني، تسكن رغبة عارمة في الحفاظ على الجمال وسط التحديات. انطلقت <span className="font-bold text-[#4a3728] dark:text-[#e8dcc4]">"أثر"</span> لتكون تلك المساحة التي يتنفس فيها الفن الفلسطيني بحرية، بعيداً عن قيود الجغرافيا.
                </p>
                <p>
                  نحن لا نبيع مجرد منتجات؛ نحن نروي قصصاً طُرزت بخيوط الصبر، ونمنحك فرصة لاقتناء قطعة من روح الأرض المباركة. هدفنا هو تمكين المبدع اقتصادياً ومعنوياً، ليبقى صوته الفني مسموعاً عبر القارات.
                </p>
              </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 px-6 bg-[#f2f0eb] dark:bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-[#8a7264] text-sm font-bold uppercase tracking-widest mb-6 block">القيم الجوهرية</span>
          <h2 className="text-4xl md:text-6xl font-bold font-art mb-20 text-[#2c1e15] dark:text-[#e8dcc4]">ما نؤمن به ونلتزم به</h2>
          
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
                className="bg-white dark:bg-black p-12 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 dark:border-gray-800 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
              >
                <div className="w-20 h-20 bg-[#faf9f6] dark:bg-[#111111] rounded-3xl flex items-center justify-center mb-10 mx-auto group-hover:bg-brown-gradient group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                  <i className={`fa-solid ${value.icon} text-3xl`}></i>
                </div>
                <h3 className="text-3xl font-bold font-art mb-6 text-[#1a0f0a] dark:text-[#e8dcc4]">{value.title}</h3>
                <p className="text-gray-500 dark:text-[#cfc3b9] font-light leading-relaxed text-lg">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#8a7264] text-sm font-bold uppercase tracking-widest mb-6 block">الفريق المؤسس</span>
            <h2 className="text-4xl md:text-6xl font-bold font-art mb-6 text-[#2c1e15] dark:text-[#e8dcc4]">العقول التي بنت أثر</h2>
            <p className="text-lg text-gray-500 dark:text-[#cfc3b9] font-light max-w-2xl mx-auto leading-relaxed">
              ثلاث مبدعات جمعهن حلم واحد؛ بناء الجسر الرقمي الذي يحمل الفن الفلسطيني إلى قلوب العالم.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {creators.map((creator, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="group"
            >
              <div className="bg-white dark:bg-black rounded-[40px] p-10 shadow-sm border border-gray-100 dark:border-gray-800 dark:border-gray-800 hover:shadow-2xl transition-all duration-500 text-center relative overflow-hidden">

                {/* Background decoration blob */}
                <div
                  className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-[0.06] pointer-events-none"
                  style={{ background: creator.gradient }}
                />

                {/* Avatar */}
                <div className="relative w-36 h-36 mx-auto mb-8">
                  {/* Outer slow-spinning dashed ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px dashed ${creator.ringColor}55` }}
                  />
                  {/* Cardinal dot decorations */}
                  {[0, 90, 180, 270].map((deg) => (
                    <div
                      key={deg}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        background: creator.ringColor,
                        top: "50%",
                        left: "50%",
                        transform: `rotate(${deg}deg) translateY(-69px) translateX(-4px)`,
                        opacity: 0.5,
                      }}
                    />
                  ))}
                  {/* Inner gradient circle */}
                  <div
                    className="absolute inset-4 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500"
                    style={{ background: creator.gradient }}
                  >
                    <i className={`fa-solid ${creator.icon} text-3xl text-white/90`} />
                  </div>
                </div>

                {/* English name subtle label */}
                <p className="text-xs font-bold tracking-[0.2em] text-[#8a7264]/60 uppercase mb-1">
                  {creator.englishName}
                </p>
                {/* Arabic name */}
                <h3 className="text-3xl font-bold font-art text-[#1a0f0a] dark:text-[#e8dcc4] mb-4">
                  {creator.name}
                </h3>

                {/* Role badge */}
                <span
                  className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest border mb-6"
                  style={{
                    background: `${creator.ringColor}12`,
                    color: creator.ringColor,
                    borderColor: `${creator.ringColor}30`,
                  }}
                >
                  {creator.role}
                </span>

                {/* Description */}
                <p className="text-gray-500 font-light leading-relaxed text-base">
                  {creator.desc}
                </p>

              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
