import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function GalleryPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const galleryImages = useQuery(api.gallery.listGalleryImages, { activeOnly: true });
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: t('gallery.all') },
    { id: "events", label: t('gallery.events') },
    { id: "meetings", label: t('gallery.meetings') },
    { id: "campaigns", label: t('gallery.campaigns') },
    { id: "general", label: t('gallery.general') },
  ];

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.label : category;
  };

  if (galleryImages === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const filteredImages = activeCategory === "all" 
    ? galleryImages 
    : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 ${isRTL ? 'text-start' : 'text-left'}`}>
          {t('gallery.title')}
        </h1>
        <p className={`text-xl text-gray-600 ${isRTL ? 'text-start' : 'text-left'}`}>
          {t('gallery.subtitle')}
        </p>
      </motion.div>

      {/* فلتر التصنيفات */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filteredImages.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('gallery.noPhotos')}</h3>
          <p className="text-gray-600">{t('gallery.noPhotosDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <GalleryCard
              key={image._id}
              image={image}
              onClick={() => setSelectedImage(image)}
              getCategoryLabel={getCategoryLabel}
              isRTL={isRTL}
            />
          ))}
        </div>
      )}

      {/* Modal لعرض الصورة بحجم كبير */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all`}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-center text-white">
              <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
              {selectedImage.caption && (
                <p className="text-gray-300 mt-2">{selectedImage.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryCard({ 
  image, 
  onClick,
  getCategoryLabel,
  isRTL
}: { 
  image: any; 
  onClick: () => void;
  getCategoryLabel: (category: string) => string;
  isRTL: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
    >
      <img
        src={image.url}
        alt={image.title}
        className="w-full h-64 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 start-0 end-0 p-6">
          <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full mb-2">
            {getCategoryLabel(image.category)}
          </span>
          <h3 className={`text-white font-bold text-lg ${isRTL ? 'text-start' : 'text-left'}`}>{image.title}</h3>
          {image.caption && (
            <p className={`text-gray-300 text-sm mt-1 ${isRTL ? 'text-start' : 'text-left'} line-clamp-2`}>{image.caption}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
