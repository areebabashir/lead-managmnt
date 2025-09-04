import React, { useState } from "react";
import { Search, Book, Plus, FileText, Video, HelpCircle } from "lucide-react";

const mockArticles = [
  {
    id: 1,
    title: "Getting Started with Lead Management",
    category: "Basics",
    views: 1234,
    type: "article",
  },
  {
    id: 2,
    title: "Setting up SMS Campaigns",
    category: "Marketing",
    views: 856,
    type: "article",
  },
  {
    id: 3,
    title: "API Integration Guide",
    category: "Technical",
    views: 642,
    type: "article",
  },
  {
    id: 4,
    title: "Dashboard Overview Video",
    category: "Tutorials",
    views: 1058,
    type: "video",
  },
  {
    id: 5,
    title: "Troubleshooting Common Issues",
    category: "Support",
    views: 923,
    type: "article",
  },
];

const categories = [
  { name: "Getting Started", count: 12, icon: Book, color: "blue" },
  { name: "Lead Management", count: 8, icon: FileText, color: "green" },
  { name: "Technical Guides", count: 15, icon: HelpCircle, color: "purple" },
  { name: "Video Tutorials", count: 6, icon: Video, color: "orange" },
];

const Badge = ({ children, variant = "default", className = "" }) => {
  const variantClasses =
    variant === "secondary"
      ? "bg-orange-100 text-orange-500"
      : "bg-blue-100 text-blue-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

type ButtonProps = {
  children: React.ReactNode;
  variant?: "default" | "outline" | string;
  className?: string;
  onClick?: () => void;
};

const Button = ({
  children,
  variant = "default",
  className = "",
  onClick,
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses =
    variant === "outline"
      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
      : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Input = ({ placeholder, className = "" }) => (
  <input
    type="text"
    placeholder={placeholder}
    className={`flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${className}`}
  />
);

const AddArticleModal = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Add New Article
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Article Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option>Select Category</option>
                <option value="basics">Basics</option>
                <option value="marketing">Marketing</option>
                <option value="technical">Technical</option>
                <option value="tutorials">Tutorials</option>
                <option value="support">Support</option>
              </select>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Content Type</option>
                <option value="article">Article</option>
                <option value="video">Video</option>
              </select>
              <textarea
                placeholder="Article content..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex gap-3 pt-4 justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-[10px] text-base font-semibold border border-orange-500 text-orange-500 bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-[10px] text-base font-semibold bg-orange-500 text-white"
                >
                  Add Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const getCategoryColor = (color) => {
  const colorMap = {
    blue: "bg-orange-100 text-black",
    green: "bg-orange-100 text-black",
    purple: "bg-orange-100 text-black",
    orange: "bg-orange-100 text-black",
  };
  return colorMap[color] || "bg-gray-100 text-gray-600";
};

const getCategoryIconColor = (color) => {
  const colorMap = {
    blue: "text-black",
    green: "text-black",
    purple: "text-black",
    orange: "text-black",
  };
  return colorMap[color] || "text-gray-500";
};

export default function SupportKnowledgeBase() {
  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-600">
              Find helpful guides and documentation
            </p>
          </div>
          <AddArticleModal
            trigger={
              <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-[10px] text-base font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                New Article
              </button>
            }
          />
        </div>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Search knowledge base..." className="pl-10" />
        </div>

        {/* Categories (equal height cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="transform transition-all duration-300 hover:scale-[1.02]"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
              }}
            >
              <Card className="cursor-pointer group h-full">
                <CardContent className="p-6 flex flex-col items-start justify-center h-full">
                  <div
                    className={`p-3 rounded-xl ${getCategoryColor(
                      category.color
                    )}`}
                  >
                    <category.icon
                      className={`h-6 w-6 ${getCategoryIconColor(
                        category.color
                      )}`}
                    />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900  transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.count} articles
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Popular Articles */}
        <div
          className="transform transition-all duration-300"
          style={{
            animation: "fadeInUp 0.3s ease-out 0.4s both",
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Popular Articles</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              {mockArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors group"
                  style={{
                    animation: `fadeInUp 0.2s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-[10px]">
                      {article.type === "video" ? (
                        <Video className="h-5 w-5 text-black" />
                      ) : (
                        <FileText className="h-5 w-5 text-black" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 transition-colors">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{article.category}</Badge>
                        <span className="text-xs text-gray-500">
                          {article.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
