import { ReactIcon } from "@/components/icons/react-icon";
import { VueIcon } from "@/components/icons/vue-icon";
import { SvelteIcon } from "@/components/icons/svelte-icon";
import { SolidIcon } from "@/components/icons/solid-icon";
import { LogoIcon } from "@/components/icons/logo-icon";

interface Framework {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color?: string;
}

const FRAMEWORKS: Framework[] = [
  { name: "React", icon: ReactIcon, color: "#61DAFB" },
  { name: "Vue", icon: VueIcon, color: "#4FC08D" },
  { name: "Svelte", icon: SvelteIcon, color: "#FF3E00" },
  { name: "Solid", icon: SolidIcon },
];

export const ProjectInfo = () => {
  return (
    <div className="flex flex-col gap-3">
      <LogoIcon className="size-8 text-foreground" />
      <h1 className="text-base font-medium tracking-tight">element-source</h1>
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        Get the source file location of any DOM element.
      </p>
      <div className="flex items-center gap-3 pt-1">
        {FRAMEWORKS.map(({ name, icon: Icon, color }) => (
          <div
            key={name}
            className="flex items-center gap-1.5 text-sm text-muted-foreground sm:text-[15px]"
          >
            <Icon className="size-3.5" style={color ? { color } : undefined} />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
