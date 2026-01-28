import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect, useState } from 'react';
import { FormInputField } from './FormInputField';

const meta = {
  title: 'Shared/UI/Form/FormInputField',
  component: FormInputField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '입력 필드 라벨',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: '입력 필드 타입',
    },
    placeholder: {
      control: 'text',
      description: '플레이스홀더 텍스트',
    },
    required: {
      control: 'boolean',
      description: '필수 입력 여부',
    },
    error: {
      control: 'text',
      description: '에러 메시지',
    },
    helperText: {
      control: 'text',
      description: '도움말 텍스트',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 여부',
    },
  },
} satisfies Meta<typeof FormInputField>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledFormInputField(
  props: React.ComponentProps<typeof FormInputField> & {
    /** 스토리에서 초기값을 쉽게 넣는 용도로 사용 */
    initialValue?: string;
  },
) {
  const {
    initialValue,
    value: valueFromArgs,
    onChange: onChangeFromArgs,
    ...rest
  } = props;

  // args에 value가 들어오면 우선적으로 그 값을 초기값으로 반영하도록 함
  const [value, setValue] = useState<string>(
    (typeof valueFromArgs === 'string' ? valueFromArgs : undefined) ??
      initialValue ??
      '',
  );

  useEffect(() => {
    if (typeof valueFromArgs === 'string') {
      setValue(valueFromArgs);
    }
  }, [valueFromArgs]);

  return (
    <div className="w-full max-w-md">
      <FormInputField
        {...rest}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChangeFromArgs?.(e);
        }}
      />
    </div>
  );
}

function AllTypesDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  return (
    <div className="w-full max-w-md space-y-4 p-4">
      <FormInputField
        label="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        required
      />
      <FormInputField
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="8자 이상 입력해주세요"
        required
        helperText="영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요."
      />
      <FormInputField
        label={
          <>
            닉네임 <span className="text-gray-400">(선택)</span>
          </>
        }
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="어떻게 불러드릴까요?"
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    label: '이메일',
    type: 'email',
    placeholder: 'user@example.com',
    required: true,
  },
  render: (args) => <ControlledFormInputField {...args} initialValue="" />,
};

export const WithError: Story = {
  args: {
    label: '이메일',
    type: 'email',
    placeholder: 'user@example.com',
    required: true,
    error: '올바른 이메일 형식이 아닙니다.',
  },
  render: (args) => (
    <ControlledFormInputField {...args} initialValue="invalid-email" />
  ),
};

export const WithHelperText: Story = {
  args: {
    label: '비밀번호',
    type: 'password',
    placeholder: '8자 이상 입력해주세요',
    required: true,
    helperText: '영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.',
  },
  render: (args) => <ControlledFormInputField {...args} initialValue="" />,
};

export const Disabled: Story = {
  args: {
    label: '이메일',
    type: 'email',
    placeholder: 'user@example.com',
    value: 'user@example.com',
    disabled: true,
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <FormInputField {...args} />
    </div>
  ),
};

export const AllTypes: Story = {
  args: {
    label: '이메일',
    type: 'email',
    placeholder: 'user@example.com',
    required: true,
  },
  render: () => <AllTypesDemo />,
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        story: '다양한 타입의 입력 필드를 한 화면에서 비교합니다.',
      },
    },
  },
};
