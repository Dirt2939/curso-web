import {
  Mail,
  User,
  Phone,
  Shield,
  CircleCheck,
  CalendarDays,
  CalendarClock,
} from "lucide-react";
import { Fragment, type ReactNode } from "react";
import type UserData from "../types/User";

type UserProfileData = Omit<UserData, "uuid">

const titlesKeys: Record<keyof UserProfileData, string>= {
  name: "Nome completo",
  email: "Email",
  phone: "Telefone",
  role: "Função",
  isActive: "Status",
  createdAt: "Criado em",
  updatedAt: "Atulizado em",
};

const iconSize = 20;

const iconKeys: Record<keyof UserProfileData, ReactNode> = {
  name: <User size={iconSize} />,
  email: <Mail size={iconSize} />,
  phone: <Phone size={iconSize} />,
  role: <Shield size={iconSize} />,
  isActive: <CircleCheck size={iconSize} />,
  createdAt: <CalendarDays size={iconSize} />,
  updatedAt: <CalendarClock size={iconSize} />,
};

type UserProfileDataWithoutDates = Omit<
  UserProfileData,
  "createdAt" | "updatedAt"
>;
type UserProfileDataOnlyDates = Pick<
  UserProfileData,
  "createdAt" | "updatedAt"
>;
type UserProfileDataEitherDates =
  | UserProfileDataWithoutDates
  | UserProfileDataOnlyDates;

interface UserInfoProps {
  user: UserProfileDataEitherDates;
}

function CardsProfile({ user }: UserInfoProps) {
  const formateDataHour = (data: string) => {
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(data));

    return dataFormatada;
  };

  return (
    <div className="">
      {Object.entries(user).map(([key, value]) => {
        const chave = key as keyof UserProfileData;

        return (
          <Fragment key={chave}>
            <div className="h-px w-full bg-linear-to-r from-transparent via-subtle to-transparent" />
            <div
              className="flex gap-4 pb-4 pt-4 items-center py-2 border-b border-subtle/60 last:border-0 size-fit"
            >
              <div className="bg-elevated text-accent items-center p-2 size-fit rounded-full">
                {iconKeys[chave]}
              </div>
              <div className="">
                <h2 className="text-xs text-primary">{titlesKeys[chave]}</h2>
                <h3 className="text-secondary">
                  {chave === "isActive"
                    ? value
                      ? "Ativo"
                      : "Inativo"
                    : (chave === "createdAt" || chave === "updatedAt") &&
                        formateDataHour
                      ? formateDataHour(value as string)
                      : value}
                </h3>
              </div>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

export default CardsProfile;
