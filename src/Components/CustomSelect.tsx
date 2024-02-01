/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import classNames from 'classnames';

const CustomSelect: React.FC<{
  loadOptions?: (...args: any[]) => void;
  setValues: (...args: any[]) => void;
  isMulti?: boolean;
  isAsync?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: { label: string; value: string };
  containerClasses?: string;
  isClearable?: boolean;
}> = ({
  loadOptions,
  setValues,
  isMulti = false,
  isAsync = false,
  options,
  placeholder,
  defaultValue,
  containerClasses,
  isClearable = false
}) => {
  if (isAsync)
    return (
      <AsyncSelect
        loadOptions={loadOptions}
        defaultOptions
        cacheOptions
        unstyled
        isMulti={isMulti}
        onChange={(value) => {
          setValues(value);
        }}
        isClearable={isClearable}
        placeholder={placeholder || 'Select'}
        classNames={{
          container: () => classNames(containerClasses),
          clearIndicator: () => classNames('text-white', 'p-2'),
          control: ({ isDisabled, isFocused }) =>
            classNames(
              'text-2xl',
              'bg-accent bg-opacity-10',
              'rounded-lg',
              'border-[1px] border-white border-opacity-50',
              isDisabled ? 'border-opacity-50' : '',
              'p-2',
              isFocused ? 'border-opacity-100' : ''
            ),
          dropdownIndicator: ({ isFocused }) =>
            classNames(
              'text-white opacity-50',
              isFocused && 'opacity-100',
              'p-2'
            ),
          group: () => classNames('py-2'),
          groupHeading: () =>
            classNames(
              'text-neutral-400',
              'text-xs',
              'font-medium',
              'mb-1',
              'px-3',
              'uppercase'
            ),
          // indicatorsContainer: () => classNames(),
          indicatorSeparator: ({ isDisabled, isFocused }) =>
            classNames(
              'bg-white bg-opacity-50',
              isDisabled && 'bg-opacity-50',
              isFocused ? 'bg-opacity-100' : '',
              'my-2'
            ),
          input: () => classNames('m-0.5', 'py-0.5', 'text-white'),
          loadingIndicator: () => classNames('text-white', 'p-2'),
          loadingMessage: () => classNames('text-accent', 'py-2', 'px-3'),
          menu: () =>
            classNames(
              'bg-black text-white',
              'rounded-md',
              'my-1',
              'border-[1px] border-white'
            ),
          menuList: () => classNames('py-1'),
          // menuPortal: () => classNames(),
          multiValue: () => classNames('bg-accent', 'rounded-md', 'm-1'),
          multiValueLabel: () =>
            classNames('rounded-md', 'text-white', 'text-xl', 'px-2 py-1'),
          multiValueRemove: ({ isFocused }) =>
            classNames(
              'rounded-tr-md rounded-br-md',
              isFocused && 'bg-red-500 text-white',
              'px-1',
              'bg-red-500',
              'text-white'
            ),
          noOptionsMessage: () => classNames('text-accent', 'py-2', 'px-3'),
          option: ({ isDisabled, isFocused, isSelected }) =>
            classNames(
              isSelected
                ? 'bg-white'
                : isFocused
                ? 'bg-gray-600'
                : 'bg-transparent',
              isDisabled
                ? 'text-white opacity-50'
                : isSelected
                ? 'text-black'
                : 'text-white',
              'py-2',
              'px-3',
              'my-1'
            ),
          placeholder: ({ isFocused }) => {
            return classNames('text-white opacity-50', 'mx-0.5', {
              'opacity-100': isFocused,
            });
          },
          singleValue: ({ isDisabled }) =>
            classNames('text-white', isDisabled && 'opacity-50', 'mx-0.5'),
          valueContainer: () => classNames('py-0.5', 'px-2'),
        }}
      />
    );

  return (
    <Select
      options={options}
      unstyled
      isMulti={isMulti}
      onChange={(value) => {
        setValues(value);
      }}
      isClearable={isClearable}
      defaultValue={defaultValue}
      placeholder={placeholder || 'Select'}
      classNames={{
        container: () => classNames(containerClasses),
        clearIndicator: () => classNames('text-white', 'p-2'),
        control: ({ isDisabled, isFocused }) =>
          classNames(
            'text-2xl',
            'bg-accent bg-opacity-10',
            'rounded-lg',
            'border-[1px] border-white border-opacity-50',
            isDisabled ? 'border-opacity-50' : '',
            'p-2',
            isFocused ? 'border-opacity-100' : ''
          ),
        dropdownIndicator: ({ isFocused }) =>
          classNames(
            'text-white opacity-50',
            isFocused && 'opacity-100',
            'p-2'
          ),
        group: () => classNames('py-2'),
        groupHeading: () =>
          classNames(
            'text-neutral-400',
            'text-xs',
            'font-medium',
            'mb-1',
            'px-3',
            'uppercase'
          ),
        // indicatorsContainer: () => classNames(),
        indicatorSeparator: ({ isDisabled, isFocused }) =>
          classNames(
            'bg-white bg-opacity-50',
            isDisabled && 'bg-opacity-50',
            isFocused ? 'bg-opacity-100' : '',
            'my-2'
          ),
        input: () => classNames('m-0.5', 'py-0.5', 'text-white'),
        loadingIndicator: () => classNames('text-white', 'p-2'),
        loadingMessage: () => classNames('text-accent', 'py-2', 'px-3'),
        menu: () =>
          classNames(
            'bg-black text-white',
            'rounded-md',
            'my-1',
            'border-[1px] border-white'
          ),
        menuList: () => classNames('py-1'),
        // menuPortal: () => classNames(),
        multiValue: () => classNames('bg-accent', 'rounded-md', 'm-1'),
        multiValueLabel: () =>
          classNames('rounded-md', 'text-white', 'text-xl', 'px-2 py-1'),
        multiValueRemove: ({ isFocused }) =>
          classNames(
            'rounded-tr-md rounded-br-md',
            isFocused && 'bg-red-500 text-white',
            'px-1',
            'bg-red-500',
            'text-white'
          ),
        noOptionsMessage: () => classNames('text-accent', 'py-2', 'px-3'),
        option: ({ isDisabled, isFocused, isSelected }) =>
          classNames(
            isSelected
              ? 'bg-white'
              : isFocused
              ? 'bg-gray-600'
              : 'bg-transparent',
            isDisabled
              ? 'text-white opacity-50'
              : isSelected
              ? 'text-black'
              : 'text-white',
            'py-2',
            'px-3',
            'my-1'
          ),
        placeholder: ({ isFocused }) => {
          return classNames('text-white opacity-50', 'mx-0.5', {
            'opacity-100': isFocused,
          });
        },
        singleValue: ({ isDisabled }) =>
          classNames('text-white', isDisabled && 'opacity-50', 'mx-0.5'),
        valueContainer: () => classNames('py-0.5', 'px-2'),
      }}
    />
  );
};

export default CustomSelect;
