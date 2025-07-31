const qualityMap = {
  "Very Bad": { level: 1, label: "Very Bad", color: "bg-red-600", text: "text-red-600" },
  "Bad": { level: 2, label: "Bad", color: "bg-orange-400", text: "text-orange-500" },
  "Neutral": { level: 3, label: "Neutral", color: "bg-yellow-400", text: "text-yellow-600" },
  "Good": { level: 4, label: "Good", color: "bg-green-400", text: "text-green-600" },
  "Very Good": { level: 5, label: "Very Good", color: "bg-green-600", text: "text-green-700" }
};

export default function FeedbackQualityMeter({ quality }) {
  const maxLevel = 5;
  const info = qualityMap[quality] || qualityMap["Neutral"];
  return (
    <div className="my-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 flex space-x-1">
          {[...Array(maxLevel)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded ${i < info.level ? info.color : "bg-gray-200"}`}
              style={{ flex: 1, transition: "background 0.3s" }}
            />
          ))}
        </div>
        <span className={`ml-2 text-sm font-semibold ${info.text}`}>{info.label}</span>
      </div>
    </div>
  );
}
