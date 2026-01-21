import { motion } from "framer-motion";
import { Quote, User, Loader2, Target, Heart, Shield, Globe, ArrowLeft } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface SecretaryGeneralPageENProps {
  setCurrentPage?: (page: string) => void;
}

export default function SecretaryGeneralPageEN({ setCurrentPage }: SecretaryGeneralPageENProps) {
  const settings = useQuery(api.adminSettings.getSecretaryGeneralSettings);
  const settingsEN = useQuery(api.adminSettings.getSecretaryGeneralSettingsEN);

  if (settings === undefined || settingsEN === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-red-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Split the Secretary General's speech into paragraphs
  const speechParagraphs = settingsEN?.speechContent
    ? settingsEN.speechContent.split("\n\n").filter((p: string) => p.trim())
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-red-50" dir="ltr">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-xl mb-6">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Message from the Secretary General
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A message from the leadership of the National Democratic Rally
          </p>
          {/* Button to switch to Arabic version */}
          {setCurrentPage && (
            <button
              onClick={() => setCurrentPage("secretaryGeneral")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              <Globe className="w-5 h-5" />
              عرض النسخة العربية
            </button>
          )}
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Secretary General Photo */}
          <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-green-600 via-green-700 to-red-600">
            {settings?.photoUrl ? (
              <img 
                src={settings.photoUrl}
                alt={settingsEN?.fullName || "Secretary General"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <User className="w-32 h-32 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50 text-lg">Photo not available</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            {/* Name Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {settingsEN?.fullName || "Secretary General"}
                </h2>
                <p className="text-white/80 text-lg">
                  {settingsEN?.bio || "Secretary General of the National Democratic Rally"}
                </p>
              </div>
            </div>
          </div>

          {/* Speech Content */}
          <div className="p-8 md:p-12 lg:p-16">
            {/* Opening */}
            <div className="flex items-start gap-6 mb-10">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Quote className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  In the name of God, the Most Gracious, the Most Merciful
                </h2>
                <p className="text-lg text-gray-600">
                  Dear brothers and sisters, members of the National Democratic Rally
                </p>
              </div>
            </div>

            {/* Speech Paragraphs */}
            <div className="prose prose-lg max-w-none space-y-6">
              {speechParagraphs.length > 0 ? (
                speechParagraphs.map((paragraph: string, index: number) => (
                  <motion.p 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-gray-700 leading-relaxed text-lg"
                  >
                    {paragraph}
                  </motion.p>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <Quote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 italic text-lg">
                    The Secretary General's message has not been added yet.
                  </p>
                </div>
              )}

              {/* Slogan Quote */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-green-50 via-white to-red-50 rounded-2xl p-8 mt-10 border border-green-100"
              >
                <p className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
                  "Together ... Vision & Achievement"
                </p>
                <p className="text-gray-600 text-center text-lg">
                  Our slogan that unites us and unifies our efforts towards a better future
                </p>
              </motion.div>

              {/* Signature */}
              <div className="border-t-2 border-gray-100 pt-8 mt-10">
                <p className="text-gray-900 font-bold text-xl">
                  {settingsEN?.fullName || "Secretary General"}
                </p>
                <p className="text-gray-500 mt-1">
                  Secretary General of the National Democratic Rally
                </p>
                <p className="text-gray-400 mt-2">
                  {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vision, Mission, Values Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Vision Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-green-500">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              Building a strong and prosperous democratic Algeria that respects human rights and ensures social justice for all citizens
            </p>
          </div>

          {/* Mission Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-red-500">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-6 shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              Peaceful and honest political work to achieve comprehensive and sustainable development in all fields
            </p>
          </div>

          {/* Values Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border-t-4 border-blue-500">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Values</h3>
            <p className="text-gray-600 leading-relaxed">
              Democracy, transparency, accountability, social justice, and commitment to serving the nation and citizens
            </p>
          </div>
        </motion.div>

        {/* Party Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-green-600 to-red-600 rounded-3xl p-8 md:p-12 text-white text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            National Democratic Rally
          </h3>
          <p className="text-white/90 text-lg max-w-3xl mx-auto mb-6">
            A political party founded on February 21, 1997 in accordance with the provisions of the Constitution and the laws of the Republic. Open to all citizens who believe in its philosophy, principles and programs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <p className="text-sm text-white/80">Founded</p>
              <p className="text-xl font-bold">1997</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <p className="text-sm text-white/80">Headquarters</p>
              <p className="text-xl font-bold">Algiers</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
              <p className="text-sm text-white/80">Presence</p>
              <p className="text-xl font-bold">59 Wilayas</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
