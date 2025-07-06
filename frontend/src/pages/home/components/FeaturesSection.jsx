const bulletPoints = [
  "Saves hours of manual scheduling",
  "Prevents teacher/class conflicts",
  "Works for any school or college",
  "Free to use",
];

function FeaturesSection() {
  return (
    
      <div className="bg-body-secondary mt-5 mb-5 rounded-4 p-3 w-50">
        {bulletPoints.map((points, index) => {
          return (
            <p key={index} className="text-center fs-5">
              {points}
            </p>
          );
        })}
      </div>
   
  );
}

export default FeaturesSection;
