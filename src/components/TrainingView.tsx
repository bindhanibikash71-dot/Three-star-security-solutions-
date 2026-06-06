/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  HelpCircle, 
  Languages, 
  ShieldCheck, 
  PhoneCall,
  Flame,
  UserCheck
} from 'lucide-react';
import { useAppTheme } from './ThemeContext';

export const TrainingView: React.FC = () => {
  const { lang } = useAppTheme();
  const [activeManual, setActiveManual] = useState<'sop' | 'emergency' | 'visitors' | 'checklist'>('sop');

  // Translations data for Training Material
  const manuals = {
    sop: {
      title: {
        en: "Standard Operating Procedures (SOP)",
        hi: "मानक संचालन प्रक्रियाएं (SOP)",
        or: "ଷ୍ଟାଣ୍ଡାର୍ଡ ଅପରେଟିଂ ପ୍ରୋସେଡ୍ୟୁର (SOP)"
      },
      content: {
        en: `• Always wear the complete clean uniform while on station duty. Keep the security badge visible.
• Perform physical perimeter patrol search twice during every 12-hour shift deployment.
• Verify and validate gate pass entry clearance codes for every inbound commercial logistics vehicle.
• Handover keys, asset locks, radio frequencies, and incident books systematically during shift changes.
• Log active checked in visitors with valid host approvals on database.db logs ledger.`,
        hi: `• स्टेशन ड्यूटी पर हमेशा पूरी साफ वर्दी पहनें। सुरक्षा बैज को दृश्यमान रखें।
• प्रत्येक 12 घंटे की शिफ्ट तैनाती के दौरान दो बार पक्की घेराबंदी गश्त खोज करें।
• प्रत्येक आने वाले व्यावसायिक लॉजिस्टिक्स वाहन के लिए गेट पास प्रवेश मंजूरी कोड सत्यापित करें।
• शिफ्ट परिवर्तनों के दौरान चाबियाँ, संपत्ति ताले, रेडियो आवृत्तियों और घटना पुस्तिकाओं को व्यवस्थित रूप से सौंपें।
• डेटाबेस में वैध होस्ट अनुमोदनों के साथ सक्रिय रूप से चेक इन किए गए आगंतुकों को लॉग करें।`,
        or: `• ଷ୍ଟେସନ ଡ୍ୟୁଟିରେ ଥିବାବେଳେ ସର୍ବଦା ସମ୍ପୂର୍ଣ୍ଣ ସଫା ୟୁନିଫର୍ମ ପିନ୍ଧନ୍ତୁ | ସୁରକ୍ଷା ବ୍ୟାଜ୍ ଦୃଶ୍ୟମାନ ରଖନ୍ତୁ |
• ପ୍ରତ୍ୟେକ ୧୨-ଘଣ୍ଟା ସିଫ୍ଟ ମୁତୟନ ସମୟରେ ଦୁଇଥର ଭୌତିକ ପାଟ୍ରୋଲିଂ କରନ୍ତୁ |
• ପ୍ରତ୍ୟେକ ବାଣିଜ୍ୟିକ ଯାନବାହନ ପ୍ରବେଶ ପାଇଁ ଗେଟ୍ ପାସ୍ ଯାଞ୍ଚ କରି କ୍ଲିଅରାନ୍ସ ଦିଅନ୍ତୁ |
• ସିଫ୍ଟ ପରିବର୍ତ୍ତନ ସମୟରେ ଚାବି, ଲକ୍, ରେଡିଓ ଫ୍ରିକ୍ୱେନ୍ସି ଏବଂ ଘଟଣା ଡାଏରୀ ବୁକ୍ ବ୍ୟବସ୍ଥିତ ଭାବରେ ହସ୍ତାନ୍ତର କରନ୍ତୁ |
• ଡାଟାବେସ ଲଗ୍ ବହିରେ ହୋଷ୍ଟ ଅନୁମୋଦନ ସହିତ ଆଗନ୍ତୁକମାନଙ୍କୁ ପଞ୍ଜିକୃତ କରନ୍ତୁ |`
      }
    },
    emergency: {
      title: {
        en: "Emergency Response & Drills Protocols",
        hi: "आपातकालीन प्रतिक्रिया और ड्रिल प्रोटोकॉल",
        or: "ଜରୁରୀକାଳୀନ ପ୍ରତିକ୍ରିୟା ନିୟମାବଳୀ"
      },
      content: {
        en: `• In case of FIRE alarm triggers: Guide people safely to designated assembly muster points. Alert fire response dispatcher immediately.
• Intrusion alarms: Secure main sector gates immediately. Mobilize standby armed responders. Log intruder details before handovers.
• Hazard fault spills: Seal off hazard corridors. Alert maintenance facilities manager. Contact emergency backup services.`,
        hi: `• आग के अलार्म बजने की स्थिति में: लोगों को सुरक्षित रूप से नामित असेंबली पॉइंट तक ले जाएं। फायर डिस्पैचर को तुरंत सूचित करें।
• घुसपैठ अलार्म: मुख्य गेटों को तुरंत बंद करें। अतिरिक्त सशस्त्र कर्मियों को लामबंद करें।
• खतरनाक रिसाव: खतरनाक क्षेत्रों को सील करें। रखरखाव सुविधा प्रबंधक को सूचित करें।`,
        or: `• ଅଗ୍ନିକାଣ୍ଡ ଆଲାରାମ ବାଜିଲେ: ଲୋକମାନଙ୍କୁ ସୁରକ୍ଷିତ ଭାବରେ ସାଇଟର ନିର୍ଦ୍ଦିଷ୍ଟ ଆସେମ୍ବଲି ପଏଣ୍ଟକୁ ନେଇଯାଆନ୍ତୁ | ତୁରନ୍ତ ଦମକଳ ବାହିନୀକୁ ଖବର ଦିଅନ୍ତୁ |
• ଅନୁପ୍ରବେଶ ଆଲାରାମ: ତୁରନ୍ତ ମୁଖ୍ୟ ପ୍ରବେଶ ଦ୍ୱାରଗୁଡିକ ବନ୍ଦ କରନ୍ତୁ | ଅତିରିକ୍ତ ସୁରକ୍ଷା କର୍ମୀଙ୍କୁ ଡାକନ୍ତୁ |
• ବିପଜ୍ଜନକ ଗ୍ୟାସ୍ ଲିକ୍: ବିପଦପୂର୍ଣ୍ଣ ଅଞ୍ଚଳକୁ ସିଲ୍ କରନ୍ତୁ | ରକ୍ଷଣାବେକ୍ଷଣ ପରିଚାଳକଙ୍କୁ ଜଣାନ୍ତୁ |`
      }
    },
    visitors: {
      title: {
        en: "Guest Access & Verification",
        hi: "अतिथि प्रवेश और सत्यापन",
        or: "ଅତିଥି ପ୍ରବେଶ ଏବଂ ଯାଞ୍ଚ"
      },
      content: {
        en: `• Verify the pre-approved visitor invite on the security system dashboard before clearing the physical gate.
• Make sure the visitor presents a physical identity card. Register details in the electronic portal.
• Provide temporary visitor tag badge and escort protocols if they are accessing restricted corporate zones.`,
        hi: `• भौतिक गेट साफ़ करने से पहले सुरक्षा प्रणाली डैशबोर्ड पर पूर्व-अनुमोदित आगंतुक आमंत्रण को सत्यापित करें।
• सुनिश्चित करें कि आगंतुक एक भौतिक पहचान पत्र प्रस्तुत करता है। इलेक्ट्रॉनिक पोर्टल में विवरण दर्ज करें।
• यदि वे प्रतिबंधित कॉर्पोरेट क्षेत्रों तक पहुंच रहे हैं तो अस्थायी आगंतुक टैग बैज और एस्कॉर्ट प्रोटोकॉल प्रदान करें।`,
        or: `• ଭୌତିକ ଗେଟ୍ ଖୋଲିବା ପୂର୍ବରୁ ସୁରକ୍ଷା ସିଷ୍ଟମ୍ ଡ୍ୟାସବୋର୍ଡରେ ପୂର୍ବ-ଅନୁମୋଦିତ ଅତିଥି ନିମନ୍ତ୍ରଣ ଯାଞ୍ଚ କରନ୍ତୁ |
• ଅତିଥି ଏକ ଭୌତିକ ପରିଚୟ ପତ୍ର ପ୍ରଦାନ କରୁଛନ୍ତି କି ନାହିଁ ନିଶ୍ଚିତ କରନ୍ତୁ | ଇଲେକ୍ଟ୍ରୋନିକ୍ ପୋର୍ଟାଲରେ ବିବରଣୀ ପଞ୍ଜିକୃତ କରନ୍ତୁ |
• ଯଦି ସେମାନେ ପ୍ରତିବନ୍ଧିତ କର୍ପୋରେଟ୍ ଜୋନରେ ପ୍ରବେଶ କରୁଛନ୍ତି ତେବେ ଅସ୍ଥାୟୀ ଭିଜିଟର ବ୍ୟାଜ୍ ଏବଂ ଏସକର୍ଟ ପ୍ରୋଟୋକଲ୍ ପ୍ରଦାନ କରନ୍ତୁ |`
      }
    },
    checklist: {
      title: {
        en: "Patrol Equipment Checklist",
        hi: "गश्ती उपकरण चेकलिस्ट",
        or: "ପାଟ୍ରୋଲିଂ ଉପକରଣ ଯାଞ୍ଚ ତାଲିକା"
      },
      content: {
        en: `• Fully charged two-way Walkie-Talkie Radio transceiver.
• High beam Searchlight or heavy-duty inspection flashlight.
• Corporate Mobile terminal / Guard App verification tablet.
• Access key chain lanyards (Ensure all are accounted for).
• Physical Duty book and pen for backup offline manual logging.`,
        hi: `• पूरी तरह से चार्ज टू-वे वॉकी-टॉकी रेडियो ट्रांसीवर।
• हाई बीम सर्चलाइट या हेवी-ड्यूटी इंस्पेक्शन फ्लैशलाइट।
• कॉर्पोरेट मोबाइल टर्मिनल / गार्ड ऐप सत्यापन टैबलेट।
• एक्सेस की चेन डोरी (सुनिश्चित करें कि सभी का हिसाब है)।
• बैकअप ऑफ़लाइन मैनुअल लॉगिंग के लिए भौतिक ड्यूटी बुक और पेन।`,
        or: `• ସମ୍ପୂର୍ଣ୍ଣ ଚାର୍ଜ ଥିବା ଟୁ-ୱେ ୱାକି-ଟକି ରେଡିଓ |
• ହାଇ ବିମ୍ ସର୍ଚ୍ଚଲାଇଟ୍ କିମ୍ବା ହେଭି-ଡ୍ୟୁଟି ଇନ୍ସପେକ୍ସନ୍ ଫ୍ଲାସଲାଇଟ୍ |
• କର୍ପୋରେଟ୍ ମୋବାଇଲ୍ ଡିଭାଇସ୍ କିମ୍ବା ଗାର୍ଡ ଆପ୍ ଯାଞ୍ଚ ଟାବଲେଟ୍ |
• ଆକସେସ୍ କି ଚେନ୍ ଲାନୟାର୍ଡ (ସମସ୍ତ ଚାବି ହିସାବରେ ଅଛି କି ନାହିଁ ନିଶ୍ଚିତ କରନ୍ତୁ) |
• ବ୍ୟାକଅପ୍ ଅଫଲାଇନ୍ ମାନୁଆଲ୍ ଲଗିଂ ପାଇଁ ଭୌତିକ ଡ୍ୟୁଟି ବୁକ୍ ଏବଂ ପେନ୍ |`
      }
    }
  };

  const currentManual = manuals[activeManual];

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
      {/* Category selector panel */}
      <div class="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2 h-fit">
        <div class="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
          <BookOpen class="w-5 h-5 text-blue-400" />
          <h2 class="font-bold text-sm text-white tracking-tight">Security Training Manuals</h2>
        </div>

        <button
          id="btn-sop-manual"
          onClick={() => setActiveManual('sop')}
          class={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
            activeManual === 'sop' 
              ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          <span>1. Standard Procedures (SOP)</span>
          <ShieldCheck class="w-3.5 h-3.5" />
        </button>

        <button
          id="btn-emergency-manual"
          onClick={() => setActiveManual('emergency')}
          class={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
            activeManual === 'emergency' 
              ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          <span>2. Emergency Drills & Fire Response</span>
          <Flame class="w-3.5 h-3.5 text-amber-500" />
        </button>

        <button
          id="btn-visitors-manual"
          onClick={() => setActiveManual('visitors')}
          class={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
            activeManual === 'visitors' 
              ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          <span>3. Visitor Gate Handing SOPs</span>
          <UserCheck class="w-3.5 h-3.5 text-emerald-400" />
        </button>

        <button
          id="btn-checklist-manual"
          onClick={() => setActiveManual('checklist')}
          class={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
            activeManual === 'checklist' 
              ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
          }`}
        >
          <span>4. Daily Shift Safety Checklist Checks</span>
          <CheckSquare class="w-3.5 h-3.5 text-orange-400" />
        </button>
      </div>

      {/* Manual content reader with translated blocks */}
      <div id="manual-content-block" class="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 class="font-bold text-sm text-white tracking-tight">
              {currentManual.title[lang]}
            </h2>
            <p class="text-[10px] text-slate-500 font-mono text-left">Active Roster Training Index • Verified Standard</p>
          </div>
          
          <div class="flex items-center space-x-1 px-2 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-[10px] font-bold font-mono">
            <Languages class="w-3 h-3 text-blue-400 mr-1 shrink-0" />
            <span class="uppercase font-semibold text-slate-350">{lang === 'en' ? 'English Syllabus' : lang === 'hi' ? 'हिंदी संस्करण' : 'ଓଡ଼ିଆ ନିର୍ଦ୍ଦେଶ'}</span>
          </div>
        </div>

        {/* content box */}
        <div class="p-5 bg-slate-950 border border-slate-800 rounded-xl leading-8 whitespace-pre-wrap text-slate-250 text-sm font-sans relative overflow-hidden select-text">
          <div class="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500/[0.015] rounded-full blur-2xl"></div>
          {currentManual.content[lang]}
        </div>

        {/* emergency phone contact hotlines */}
        <div class="p-4 bg-red-950/10 border border-red-900/25 rounded-xl flex items-center justify-between gap-4">
          <div class="space-y-1">
            <h4 class="font-bold text-xs text-red-400 uppercase tracking-wider">Operational Emergency Hotline</h4>
            <p class="text-[10px] text-slate-450">Contact deployment commanders or state agencies immediately.</p>
          </div>
          <div class="flex items-center space-x-2 bg-red-500 text-white font-mono font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md cursor-pointer hover:bg-red-600 transition">
            <PhoneCall class="w-4 h-4 shrink-0" />
            <span>+91 91000 00100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
