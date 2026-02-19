declare module "react-simple-maps" {
  import { ComponentType, CSSProperties, ReactNode } from "react";

  interface ProjectionConfig {
    scale?: number;
    center?: [number, number];
    rotate?: [number, number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface GeographyStyleProps {
    default?: CSSProperties;
    hover?: CSSProperties;
    pressed?: CSSProperties;
  }

  interface GeographyProps {
    geography: GeoObject;
    style?: GeographyStyleProps;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onClick?: (event: React.MouseEvent) => void;
    key?: string;
  }

  interface GeoObject {
    rsmKey: string;
    properties: {
      name: string;
      [key: string]: unknown;
    };
  }

  interface GeographiesChildrenProps {
    geographies: GeoObject[];
  }

  interface GeographiesProps {
    geography: string | object;
    children: (data: GeographiesChildrenProps) => ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const ZoomableGroup: ComponentType<{ children?: ReactNode; [key: string]: unknown }>;
  export const Marker: ComponentType<{ coordinates: [number, number]; children?: ReactNode; [key: string]: unknown }>;
  export const Line: ComponentType<{ [key: string]: unknown }>;
  export const Annotation: ComponentType<{ [key: string]: unknown }>;
}
