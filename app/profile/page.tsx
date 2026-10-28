"use client";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import { Camera, MailCheck, MailWarning, Trash2 } from "lucide-react";
import { useCovenant } from "@/lib/auth-store";
import {
  ALCOHOL_OPTIONS,
  ATTENDANCE,
  CITIES,
  COURTSHIP_VIEWS,
  DENOMINATIONS,
  DENOMINATION_IMPORTANCE,
  EDUCATION_LEVELS,
  FAMILY_INVOLVEMENT,
  INTENTS,
  KIDS_OPTIONS,
  LANGUAGES,
  RELATIONSHIP_STATUSES,
  RELOCATE_OPTIONS,
  SMOKING_OPTIONS,
  SPIRITUAL_PRACTICES,
} from "@/lib/data";
import { VerificationBadge } from "@/components/badges";
import LocateButton from "@/components/locate-button";
import { ageFromDob, isEmailVerified } from "@/lib/safety";
import type { DenominationImportance, Gender, MemberProfile } from "@/lib/types";

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSize = 512;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas is unavailable"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image"));
    };
    image.src = objectUrl;
  });
}

export default function Profile() {
  const { state, setMemberPhoto, updateMember, showToast } = useCovenant();
  const member = state.member;
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [photoError, setPhotoError] = useState("");

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !member) return;
    try {
      const dataUrl = await compressImage(file);
      setMemberPhoto(dataUrl);
      setPhotoError("");
      showToast("Profile picture updated. Images are compressed before saving.");
    } catch {
      setPhotoError("That image could not be read. Try a JPG or PNG under 5MB.");
    }
  };

  if (!member) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-4xl text-ink">My profile</h1>
        <p className="mt-3 text-muted">Sign in to build and manage your profile.</p>
        <Link href="/signup" className="mt-8 inline-block rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground">
          Create a profile
        </Link>
      </div>
    );
  }

  const update = (patch: Partial<MemberProfile>) => updateMember({ ...member, ...patch });
  const emailVerified = isEmailVerified(member.email, state.verifiedEmail);

  const onDob = (value: string) => {
    if (!value) {
      update({ dateOfBirth: "" });
      return;
    }
    const nextAge = ageFromDob(value);
    if (nextAge === null) {
      showToast("Enter a valid date of birth.");
      return;
    }
    if (nextAge < 18 || nextAge > 100) {
      showToast("Covenant is for adults 18 and older.");
      return;
    }
    update({ dateOfBirth: value, age: nextAge });
  };

  const completeness = Math.round(
    (
      [
        member.photo,
        member.firstName,
        member.bio,
        member.verse,
        member.occupation,
        member.denomination,
        member.attendance,
        member.maritalStatus,
        member.education,
        member.churchName,
        member.practices.length > 0 ? "yes" : "",
        member.languages.length > 1 ? "yes" : "",
        emailVerified ? "yes" : "",
        member.dateOfBirth,
      ].filter(Boolean).length / 14
    ) * 100
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Profile</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">My profile</h1>
        </div>
        <Link href="/preferences" className="rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink">
          Partner preferences
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-card p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {member.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photo}
              alt={`${member.firstName || "Member"}'s profile`}
              className="h-28 w-28 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary font-serif text-4xl font-bold text-primary-foreground">
              {(member.firstName || "C").charAt(0)}
            </div>
          )}
          <div className="text-center sm:text-left">
            <h2 className="font-serif text-2xl text-ink">
              {member.firstName || "Your name"}, {member.age}
            </h2>
            <p className="text-sm text-muted">
              {member.city} · {member.denomination} · {member.intent}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <VerificationBadge level={state.verification} />
              {state.premium && (
                <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
                  Premium
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                {member.photo ? "Change photo" : "Add photo"}
              </button>
              {member.photo && (
                <button
                  type="button"
                  onClick={() => {
                    setMemberPhoto(null);
                    showToast("Profile picture removed.");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              )}
            </div>
            {photoError && <p className="mt-2 text-xs text-bad">{photoError}</p>}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">Profile completeness</span>
            <span className="text-muted">{completeness}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-canvas">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completeness}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Complete profiles get better matches and clearer “why we matched you” reasons.
          </p>
        </div>
      </div>

      <Section
        title="Contact & security"
        description="Your email receives verification codes and any safety notice about your account."
      >
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Email address</span>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={member.email}
              readOnly
              aria-readonly="true"
              className="min-w-0 flex-1 rounded-lg border border-line bg-canvas/60 px-3 py-2 text-sm text-muted"
            />
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                emailVerified
                  ? "border-ok/40 bg-ok/10 text-ok"
                  : "border-gold/40 bg-gold/10 text-gold"
              }`}
            >
              {emailVerified ? (
                <MailCheck className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <MailWarning className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {emailVerified ? "Verified" : "Not verified"}
            </span>
          </div>
          <span className="mt-1 block text-xs text-muted">
            This is your sign-in email. It is fixed for this demo; changing it requires a new account.
          </span>
        </label>

        {!emailVerified && (
          <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4">
            <p className="text-sm text-ink">
              Email verification is required before you can express interest, send messages, post in rooms
              or submit an ID check.
            </p>
            <Link
              href="/verify#email"
              className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Verify your email
            </Link>
            <p className="mt-2 text-xs text-muted">
              No real email is sent in this demo. The code is shown on the verification page and listed in
              Account → Demo inbox.
            </p>
          </div>
        )}
      </Section>

      <Section title="Basics" description="What members see about your everyday life.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="First name" value={member.firstName} onChange={(value) => update({ firstName: value })} />
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Date of birth</span>
            <input
              type="date"
              value={member.dateOfBirth}
              onChange={(event) => onDob(event.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
            />
            <span className="mt-1 block text-xs text-muted">
              Age shown to members: {member.age}. Used to cross-check against your ID.
            </span>
          </label>
          <SelectField
            label="Gender"
            value={member.gender}
            options={["Female", "Male"]}
            onChange={(value) => update({ gender: value as Gender })}
          />
          <div>
            <SelectField label="City or state" value={member.city} options={[...CITIES]} onChange={(value) => update({ city: value })} />
            <LocateButton className="mt-3" onLocation={(value) => update({ city: value })} />
          </div>
          <TextField label="Occupation" value={member.occupation} onChange={(value) => update({ occupation: value })} />
          <SelectField
            label="Education"
            value={member.education}
            options={[...EDUCATION_LEVELS]}
            onChange={(value) => update({ education: value })}
          />
          <SelectField
            label="Relationship status"
            value={member.maritalStatus}
            options={[...RELATIONSHIP_STATUSES]}
            onChange={(value) => update({ maritalStatus: value })}
          />
          <SelectField label="Children" value={member.kids} options={[...KIDS_OPTIONS]} onChange={(value) => update({ kids: value })} />
          <SelectField
            label="Willingness to relocate"
            value={member.relocate}
            options={[...RELOCATE_OPTIONS]}
            onChange={(value) => update({ relocate: value })}
          />
          <SelectField label="Alcohol" value={member.alcohol} options={[...ALCOHOL_OPTIONS]} onChange={(value) => update({ alcohol: value })} />
          <SelectField label="Smoking" value={member.smoking} options={[...SMOKING_OPTIONS]} onChange={(value) => update({ smoking: value })} />
        </div>
        <div className="mt-4">
          <MultiChoice
            label="Languages you speak"
            options={[...LANGUAGES]}
            selected={member.languages}
            onChange={(languages) => update({ languages })}
          />
        </div>
      </Section>

      <Section title="Faith" description="Faith is a first-class part of matching, treated as sensitive data.">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Denomination"
            value={member.denomination}
            options={[...DENOMINATIONS]}
            onChange={(value) => update({ denomination: value })}
          />
          <SelectField
            label="Church attendance"
            value={member.attendance}
            options={[...ATTENDANCE]}
            onChange={(value) => update({ attendance: value })}
          />
          <TextField label="Church name" value={member.churchName} onChange={(value) => update({ churchName: value })} />
          <TextField label="Church city" value={member.churchCity} onChange={(value) => update({ churchCity: value })} />
          <TextField
            label="Born again / baptism (optional)"
            value={member.bornAgain}
            onChange={(value) => update({ bornAgain: value })}
          />
          <SelectField
            label="Importance of shared denomination"
            value={member.denominationImportance}
            options={DENOMINATION_IMPORTANCE}
            onChange={(value) => update({ denominationImportance: value as DenominationImportance })}
          />
          <SelectField label="Relationship intent" value={member.intent} options={[...INTENTS]} onChange={(value) => update({ intent: value })} />
          <SelectField
            label="Views on courtship"
            value={member.courtshipViews}
            options={[...COURTSHIP_VIEWS]}
            onChange={(value) => update({ courtshipViews: value })}
          />
        </div>
        <div className="mt-4">
          <MultiChoice
            label="Spiritual practices"
            options={[...SPIRITUAL_PRACTICES]}
            selected={member.practices}
            onChange={(practices) => update({ practices })}
          />
        </div>
      </Section>

      <Section title="Story & values" description="Let members hear your heart, not just your CV.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="A verse that anchors me" value={member.verse} onChange={(value) => update({ verse: value })} />
          <TextField
            label="Career ambition"
            value={member.careerAmbition}
            onChange={(value) => update({ careerAmbition: value })}
          />
          <SelectField
            label="Family involvement"
            value={member.familyInvolvement}
            options={[...FAMILY_INVOLVEMENT]}
            onChange={(value) => update({ familyInvolvement: value })}
          />
        </div>
        <div className="mt-4">
          <TextArea label="Short bio" value={member.bio} onChange={(value) => update({ bio: value })} />
        </div>
      </Section>

      <Section title="Privacy" description="You control sensitive details. Hidden details are never shown to non-matches.">
        <div className="space-y-2">
          <Toggle
            label="Hide my church name"
            description="Only matches can see your church name and city."
            checked={member.hideChurch}
            onChange={(checked) => update({ hideChurch: checked })}
          />
          <Toggle
            label="Hide my exact location"
            description="Show only your general city area."
            checked={member.hideCity}
            onChange={(checked) => update({ hideCity: checked })}
          />
          <Toggle
            label="Hide my employer"
            description="Keep your workplace private."
            checked={member.hideEmployer}
            onChange={(checked) => update({ hideEmployer: checked })}
          />
        </div>
      </Section>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => showToast("Profile changes save automatically to your account.")}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Save changes
        </button>
        <Link href="/verify" className="rounded-full border border-line bg-card px-6 py-2.5 text-sm font-semibold text-ink">
          Verification
        </Link>
        <Link href="/account" className="rounded-full border border-line bg-card px-6 py-2.5 text-sm font-semibold text-ink">
          Account settings
        </Link>
        <span className="text-xs text-muted">Edits save automatically to your account.</span>
      </div>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-line bg-card p-6">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
      >
        {value === "" && <option value="">Select an option</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MultiChoice({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  };

  return (
    <fieldset>
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-line bg-canvas text-ink"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-line bg-canvas p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-xs text-muted">{description}</span>
      </span>
    </label>
  );
}
