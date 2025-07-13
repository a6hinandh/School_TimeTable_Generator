import "../auth.css"

function InputField({ value, placeholder, type, handleFunction }) {
 
  return (
    <div className="w-100">
      <input
        className="w-100 p-2 rounded-2 bg-dark border border-2 no-style-focus border-focus"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleFunction}
      />
    </div>
  );
}

export default InputField;
