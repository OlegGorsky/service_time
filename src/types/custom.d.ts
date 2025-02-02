declare module 'react' {
  export = React;
  export as namespace React;

  namespace React {
    interface FormEvent<T = Element> extends SyntheticEvent<T> {
      target: EventTarget & T;
    }

    interface SyntheticEvent<T = Element, E = Event> {
      bubbles: boolean;
      cancelable: boolean;
      currentTarget: EventTarget & T;
      defaultPrevented: boolean;
      eventPhase: number;
      isTrusted: boolean;
      nativeEvent: E;
      preventDefault(): void;
      stopPropagation(): void;
      target: EventTarget;
      timeStamp: number;
      type: string;
    }

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

    export const useState: typeof React.useState;
    export const useEffect: typeof React.useEffect;
    export const useRef: typeof React.useRef;
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

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
