
const FormGroup = ({label,placeholder,value,onChange,type="text"}) => {
  return (
        <div className="form-group">
            <label htmlFor={label}>{label}</label>
            <input
            value={value}
            onChange={onChange}
             type={type} id={label} name={label} placeholder={placeholder}/>
         </div>
  )
}

export default FormGroup
