import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { ResumeData } from "./ResumeSaathi";

// ✅ Use built-in Helvetica for ATS safety
Font.register({ family: "Helvetica" });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
    color: "#111",
    backgroundColor: "#ffffff",
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 3,
  },
  title: {
    fontSize: 11,
    color: "#444",
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: "#555",
  },
  section: {
    marginTop: 12,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
    color: "#111",
  },
  bold: { fontWeight: "bold" },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletSymbol: {
    width: 10,
    textAlign: "center",
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: "#111",
  },
  project: { marginBottom: 6 },
  link: { color: "#0077cc", fontSize: 9 },
  footer: {
    textAlign: "right",
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 5,
  },
  footerText: {
    fontSize: 8,
    color: "#777",
  },
});

const ResumePDF = ({ data }: { data: ResumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.personalInfo.fullName}</Text>
        <Text style={styles.title}>
          {data.professionalTitle ||
            "Full Stack Developer | Computer Science Undergraduate"}
        </Text>
        <Text style={styles.contact}>
          {[
            data.personalInfo.email,
            data.personalInfo.phone,
            data.personalInfo.city,
            data.personalInfo.linkedin,
            data.personalInfo.portfolio,
          ]
            .filter(Boolean)
            .join(" | ")}
        </Text>
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
          <Text style={styles.text}>{data.summary}</Text>
        </View>
      )}

     {/* Education */}
{data.education?.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>EDUCATION</Text>
    {data.education.map((edu, i) => (
      <View key={i} style={{ marginBottom: 8 }}>
        {/* Institution + Date Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Text style={styles.bold}>{edu.institution}</Text>
          <Text style={{ fontSize: 9, color: "#555" }}>
            {edu.startDate} - {edu.endDate}
          </Text>
        </View>

        {/* Degree + CGPA Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Text style={styles.text}>
            {edu.degree}
            {edu.cgpa ? ` • CGPA: ${edu.cgpa}` : ""}
          </Text>
        </View>
      </View>
    ))}
  </View>
)}


      {/* Experience */}
      {data.experience?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
          {data.experience.map((exp, i) => (
            <View key={i}>
              <Text style={styles.bold}>
                {exp.title} | {exp.company}
              </Text>
              <Text style={styles.text}>
                {exp.startDate} - {exp.endDate}
              </Text>
              {exp.bullets?.map((b, j) => (
                <View style={styles.bullet} key={j}>
                  <Text style={styles.bulletSymbol}>•</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
{data.projects?.length > 0 && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>PROJECTS</Text>
    {data.projects.map((p, i) => (
      <View key={i} style={styles.project}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <Text style={styles.bold}>{p.name}</Text>
          {p.link && (
            <Text style={{ ...styles.link }}>
              [Link]
            </Text>
          )}
        </View>

        {p.description && (
          <View style={styles.bullet}>
            <Text style={styles.bulletSymbol}>•</Text>
            <Text style={styles.bulletText}>{p.description}</Text>
          </View>
        )}
        {p.technologies?.length > 0 && (
          <Text style={styles.text}>
            <Text style={styles.bold}>Technologies:</Text>{" "}
            {p.technologies.join(", ")}
          </Text>
        )}
        {p.link && (
          <Text style={{ ...styles.link, marginTop: 2 }}>{p.link}</Text>
        )}
      </View>
    ))}
  </View>
)}

      {/* Skills */}
      {(data.skills?.technical?.length > 0 ||
        data.skills?.soft?.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SKILLS</Text>
          {data.skills.technical?.length > 0 && (
            <Text style={styles.text}>
              <Text style={styles.bold}>Technical:</Text>{" "}
              {data.skills.technical.join(", ")}
            </Text>
          )}
          {data.skills.soft?.length > 0 && (
            <Text style={styles.text}>
              <Text style={styles.bold}>Soft:</Text>{" "}
              {data.skills.soft.join(", ")}
            </Text>
          )}
        </View>
      )}

      {/* Certifications */}
      {data.certifications?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
          {data.certifications.map((c, i) => (
            <View style={styles.bullet} key={i}>
              <Text style={styles.bulletSymbol}>•</Text>
              <Text style={styles.bulletText}>{c}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Awards */}
      {data.awards?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AWARDS & ACHIEVEMENTS</Text>
          {data.awards.map((a, i) => (
            <View style={styles.bullet} key={i}>
              <Text style={styles.bulletSymbol}>•</Text>
              <Text style={styles.bulletText}>{a}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Generated by KIIT Saathi Resume Builder
        </Text>
      </View>
    </Page>
  </Document>
);

export const PdfGenerator = ({ data, onDownload, disabled }: any) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (disabled) {
      toast.error("Daily download limit reached. Try again tomorrow.");
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading("Generating resume PDF...");

      const blob = await pdf(<ResumePDF data={data} />).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.personalInfo.fullName.replace(
        /\s+/g,
        "_"
      )}_Resume_ATS_Optimized.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      await onDownload?.();
      toast.success("🎉 Resume downloaded successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating || disabled}
      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download Polished PDF
        </>
      )}
    </Button>
  );
};
