import React from 'react';

interface FormInputProps {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Componente de entrada de formulario estilizado
 * Usado en los formularios de autenticación
 */
const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  label,
  value,
  onChange,
  required = true,
  placeholder,
  className = ''
}) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-[#2a2827] mb-2 text-left">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-[#2a2827]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e82dc] focus:border-[#2e82dc] transition-all bg-white"
      />
    </div>
  );
};

export default FormInput; 