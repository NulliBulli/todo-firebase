export default function TodoInput(props) {
  const { todoFieldName, callback, type, value, id } = props;
  return (
    <input
      className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline m-2"
      type={type}
      placeholder={todoFieldName}
      onChange={(e) => {
        callback(todoFieldName, e.target.value, id);
      }}
      value={value}
    />
  );
}
