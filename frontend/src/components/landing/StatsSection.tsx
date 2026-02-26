import { motion } from "framer-motion";
import {
  FileIcon,
  LayoutIcon,
  SettingsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const stats = [
  {
    icon: FileIcon,
    label: "Copie questo mese",
    value: "1,547",
    color: "text-primary",
  },
  {
    icon: LayoutIcon,
    label: "Tracciamento in tempo reale",
    value: "100%",
    color: "text-green-600",
  },
  {
    icon: SettingsIcon,
    label: "Tempo risparmiato",
    value: "24h",
    color: "text-blue-600",
  },
];

const chartData = [
  { label: "Lun", value: 45 },
  { label: "Mar", value: 60 },
  { label: "Mer", value: 35 },
  { label: "Gio", value: 80 },
  { label: "Ven", value: 50 },
  { label: "Sab", value: 20 },
  { label: "Dom", value: 10 },
];


export default function StatsSection() {
  return (
    <section id="stats" className="py-20 md:py-32 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tutto sotto controllo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualizza tutte le informazioni in un'unica schermata: statistiche,
            report e analisi dei consumi.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-background rounded-lg border shadow-sm"
                >
                  <div className="p-3 rounded-full bg-primary/10">
                    <HugeiconsIcon
                      icon={stat.icon}
                      className={`h-6 w-6 ${stat.color}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
