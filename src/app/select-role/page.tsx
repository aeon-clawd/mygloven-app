"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Eyebrow } from "@/components/ui/page-head";
import { Icon } from "@/components/ui/icon";
import { Marquee } from "@/components/layout/marquee";

const roles = [
  {
    id: "productor",
    num: "01",
    title: "Productor",
    desc: "Organizo eventos y busco espacios, artistas y proveedores.",
    href: "/login?role=productor",
  },
  {
    id: "venue",
    num: "02",
    title: "Espacio",
    desc: "Tengo un local y quiero recibir solicitudes de eventos.",
    href: "/login?role=venue",
  },
  {
    id: "artista",
    num: "03",
    title: "Artista",
    desc: "Quiero que productores me encuentren para sus eventos.",
    href: "/login?role=artista",
  },
  {
    id: "proveedor",
    num: "04",
    title: "Proveedor",
    desc: "Ofrezco servicios para producción de eventos.",
    href: "/login?role=proveedor",
  },
];

const rolesMarquee = [
  "my'G — sistema operativo de eventos",
  "Cuatro entradas, un sistema",
  "Productor · Espacio · Artista · Proveedor",
];

export default function SelectRolePage() {
  useEffect(() => {
    document.body.classList.add("scroll-auto");
    return () => {
      document.body.classList.remove("scroll-auto");
    };
  }, []);

  return (
    <>
      <Marquee items={rolesMarquee} />
      <div className="roles-stage">
        <div className="head">
          <div>
            <Eyebrow>— Cómo entras al sistema</Eyebrow>
            <h1>
              ¿Qué eres,
              <br />
              esta vez<span className="ap">?</span>
            </h1>
          </div>
          <div className="text-mute" style={{ textAlign: "right" }}>
            Selecciona un rol
            <br />
            Cuatro entradas, un sistema
          </div>
        </div>

        <div className="roles-grid">
          {roles.map((r) => (
            <Link
              key={r.id}
              href={r.href}
              className="role-card"
              data-cursor="entrar →"
            >
              <div className="num">— {r.num} / 04</div>
              <div>
                <div className="title">
                  {r.title}
                  <span className="ap">.</span>
                </div>
                <p className="desc">{r.desc}</p>
              </div>
              <div className="arrow">
                Entrar <Icon.arrow />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
