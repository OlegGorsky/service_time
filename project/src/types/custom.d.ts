declare module 'react' {
  export = React;
  export as namespace React;

  namespace React {
    type FC<P = {}> = FunctionComponent<P>;

    interface FunctionComponent<P = {}> {
      (props: P & { children?: ReactNode }): ReactElement | null;
      displayName?: string;
    }

    type ReactText = string | number;
    type ReactChild = ReactElement | ReactText;
    type ReactNode = ReactChild | boolean | null | undefined;

    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }

    type JSXElementConstructor<P> = ((props: P) => ReactElement | null);

    type Key = string | number;
  }
}

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
    color?: string;
    strokeWidth?: number;
    onClick?: () => void;
  }

  interface IconComponent extends FC<IconProps> {
    displayName?: string;
  }

  export const Clock: IconComponent;
  export const Calendar: IconComponent;
  export const MapPin: IconComponent;
  export const Wrench: IconComponent;
  export const Car: IconComponent;
  export const CreditCard: IconComponent;
  export const MessageSquare: IconComponent;
  export const Edit: IconComponent;
  export const CheckCircle: IconComponent;
  export const XCircle: IconComponent;
  export const Shield: IconComponent;
  export const FileText: IconComponent;
  export const X: IconComponent;
  export const ChevronDown: IconComponent;
  export const Search: IconComponent;
  export const User: IconComponent;
  export const UserCheck: IconComponent;
  export const Plus: IconComponent;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  import { FC, SVGProps } from 'react';
  const SVG: FC<SVGProps<SVGSVGElement>>;
  export default SVG;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  disabled?: boolean;
  completed?: boolean;
  isActive?: boolean;
  onClick: () => void;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
