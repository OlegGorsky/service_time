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

    type RefCallback<T> = { bivarianceHack(instance: T | null): void }["bivarianceHack"];
    type Ref<T> = RefCallback<T> | { current: T | null } | null;
    
    interface RefAttributes<T> extends Attributes {
      ref?: Ref<T> | undefined;
    }

    interface Attributes {
      key?: Key | null | undefined;
    }

    interface HTMLAttributes<T> {
      className?: string;
      onClick?: (event: MouseEvent<T>) => void;
      onChange?: (event: ChangeEvent<T>) => void;
      onSubmit?: (event: FormEvent<T>) => void;
      value?: string | number;
      type?: string;
      placeholder?: string;
      min?: string | number;
      max?: string | number;
      step?: string | number;
      rows?: number;
      disabled?: boolean;
    }

    interface MouseEvent<T = Element> extends SyntheticEvent<T> {
      button: number;
      buttons: number;
      clientX: number;
      clientY: number;
      pageX: number;
      pageY: number;
      screenX: number;
      screenY: number;
    }

    interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
      target: EventTarget & T;
      currentTarget: EventTarget & T;
    }

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

    type Dispatch<A> = (value: A) => void;
    type SetStateAction<S> = S | ((prevState: S) => S);

    function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
    function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];

    function useRef<T>(initialValue: T): { current: T };
    function useRef<T>(initialValue: T | null): { current: T | null };

    function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;

    function forwardRef<T, P = {}>(
      render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
    ): (props: P & RefAttributes<T>) => React.ReactElement | null;

    function cloneElement<P>(
      element: ReactElement<P>,
      props?: Partial<P> & RefAttributes<any>,
      ...children: ReactNode[]
    ): ReactElement<P>;
  }
}
