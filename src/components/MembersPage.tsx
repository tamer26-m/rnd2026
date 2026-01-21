import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Users, MapPin, Phone, Mail } from "lucide-react";

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // الحصول على بيانات المنخرط من sessionStorage
  const currentMemberData = typeof window !== 'undefined' ? sessionStorage.getItem("currentMember") : null;
  const currentMember = currentMemberData ? JSON.parse(currentMemberData) : null;
  
  const allMembers = useQuery(
    api.members.listAllMembers,
    currentMember?.membershipNumber ? { membershipNumber: currentMember.membershipNumber } : "skip"
  );

  if (!currentMember || currentMember.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">ليس لديك صلاحية لعرض قائمة المنخرطين</p>
        </div>
      </div>
    );
  }

  if (!allMembers) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredMembers = allMembers.filter((member: any) =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.membershipNumber.includes(searchTerm) ||
    member.nin.includes(searchTerm)
  );

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">قائمة المنخرطين</h1>
            <p className="text-gray-600 mt-2">إجمالي المنخرطين: {allMembers.length}</p>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، رقم العضوية، أو رقم NIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* قائمة المنخرطين */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member: any) => (
            <div key={member._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{member.fullName}</h3>
                  <p className="text-sm text-gray-600 font-mono" dir="ltr">{member.membershipNumber}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{member.wilaya}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  member.status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {member.status === "active" ? "نشط" : "غير نشط"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">لا توجد نتائج للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
