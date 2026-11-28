import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    CircleQuestionMark,
    Eye,
    EyeOff,
    Loader2,
    LockKeyhole,
    Pencil,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    getSecurityQuestions,
    removeSecurityQuestions,
    saveSecurityQuestions,
} from '../../../api/securityQuestions';
import MarqueeSelect from '../../ui/MarqueeSelect';
import Modal from '../../ui/modals/Modal';

const QUESTION_COUNT = 3;
const PRESET_KEYS = [
    'securityQuestions.preset.firstSchool',
    'securityQuestions.preset.firstPet',
    'securityQuestions.preset.parentsCity',
    'securityQuestions.preset.firstConcert',
    'securityQuestions.preset.firstCar',
    'securityQuestions.preset.childhoodFriend',
    'securityQuestions.preset.childhoodStreet',
];

const emptyQuestions = () =>
    Array.from({ length: QUESTION_COUNT }, () => ({
        questionText: '',
        answer: '',
        visible: false,
    }));

const getErrorMessage = (error) =>
    error.response?.data?.error ||
    error.response?.data?.message ||
    'The request could not be completed.';

export default function SecurityQuestionsCard() {
    const { t } = useTranslation('account');

    const [questions, setQuestions] = useState([]);
    const [configured, setConfigured] = useState(false);
    const [editing, setEditing] = useState(false);
    const [formQuestions, setFormQuestions] = useState(emptyQuestions);
    const [currentPassword, setCurrentPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showDeletePassword, setShowDeletePassword] = useState(false);

    const presetOptions = PRESET_KEYS.map((key) => ({
        value: t(key),
        label: t(key),
    }));

    async function loadQuestions() {
        setLoading(true);
        try {
            const data = await getSecurityQuestions();
            const saved = data.questions || [];
            setQuestions(saved);
            setConfigured(saved.length === QUESTION_COUNT);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadQuestions();
    }, []);

    function beginEditing() {
        setFormQuestions(
            questions.length
                ? questions.map((question) => ({
                    questionText: question.questionText,
                    answer: question.answer || '',
                    visible: false,
                }))
                : emptyQuestions()
        );
        setCurrentPassword('');
        setErrors({});
        setEditing(true);
    }

    function updateQuestion(index, field, value) {
        setFormQuestions((previous) =>
            previous.map((question, currentIndex) =>
                currentIndex === index ? { ...question, [field]: value } : question
            )
        );
    }

    function validate() {
        const nextErrors = {};
        const normalized = new Set();

        formQuestions.forEach((question, index) => {
            const text = question.questionText
                .trim()
                .replace(/\s+/g, ' ')
                .toLowerCase();

            if (text.length < 10 || text.length > 200) {
                nextErrors[`question-${index}`] =
                    t('securityQuestions.validation.questionLength');
            } else if (normalized.has(text)) {
                nextErrors[`question-${index}`] =
                    t('securityQuestions.validation.questionDuplicate');
            }
            normalized.add(text);

            if (question.answer.trim().replace(/\s/g, '').length < 3) {
                nextErrors[`answer-${index}`] =
                    t('securityQuestions.validation.answerLength');
            }
        });

        if (!currentPassword) {
            nextErrors.currentPassword = t(
                'securityQuestions.validation.currentPasswordRequired'
            );
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function handleSave(event) {
        event.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            await saveSecurityQuestions(
                currentPassword,
                formQuestions.map(({ questionText, answer }) => ({
                    questionText: questionText.trim(),
                    answer,
                }))
            );
            toast.success(t('securityQuestions.toast.saved'));
            setEditing(false);
            setCurrentPassword('');
            setFormQuestions(emptyQuestions());
            await loadQuestions();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(event) {
        event.preventDefault();
        if (!deletePassword) return;

        setDeleting(true);
        try {
            await removeSecurityQuestions(deletePassword);
            toast.success(t('securityQuestions.toast.removed'));
            setConfirmDelete(false);
            setDeletePassword('');
            setConfigured(false);
            setQuestions([]);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    }

    const lastUpdated = questions
        .map((question) => question.updatedAt)
        .filter(Boolean)
        .sort()
        .at(-1);

    return (
        <>
            <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                        <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-marquee-cream">
                                {t('securityQuestions.title')}
                            </h3>
                            {configured && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                                    <ShieldCheck className="h-4 w-4" />
                                    {t('securityQuestions.configured')}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-marquee-muted">
                            {t('securityQuestions.description')}
                        </p>
                    </div>

                    {!loading && !editing && (
                        <button
                            type="button"
                            onClick={beginEditing}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-sm font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50"
                        >
                            <Pencil className="h-4 w-4 text-marquee-gold" />
                            {configured
                                ? t('securityQuestions.updateQuestions')
                                : t('securityQuestions.setUpQuestions')}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="mt-5 flex items-center gap-2 text-sm text-marquee-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('securityQuestions.loading')}
                    </div>
                ) : editing ? (
                    <form onSubmit={handleSave} className="mt-5 space-y-3">
                        <div className="rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3 text-sm text-marquee-muted">
                            {t('securityQuestions.editIntro')}
                        </div>

                        {formQuestions.map((question, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-4 space-y-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                                        <CircleQuestionMark className="h-4 w-4" />
                                    </div>
                                    <p className="text-sm font-medium text-marquee-cream">
                                        {t('securityQuestions.questionNumber', {
                                            number: index + 1,
                                        })}
                                    </p>
                                </div>

                                <MarqueeSelect
                                    id={`security-question-preset-${index}`}
                                    value=""
                                    options={presetOptions}
                                    onChange={(nextValue) => {
                                        if (nextValue)
                                            updateQuestion(index, 'questionText', nextValue);
                                    }}
                                    className="w-full"
                                    maxWidth="max-w-full"
                                />

                                <input
                                    id={`security-question-${index}`}
                                    value={question.questionText}
                                    onChange={(event) =>
                                        updateQuestion(index, 'questionText', event.target.value)
                                    }
                                    maxLength={200}
                                    minLength={10}
                                    placeholder={t(
                                        'securityQuestions.customQuestionPlaceholder'
                                    )}
                                    aria-invalid={Boolean(errors[`question-${index}`])}
                                    className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-3 py-2.5 text-sm text-marquee-cream outline-none placeholder:text-marquee-muted/60 focus:border-marquee-gold"
                                />
                                {errors[`question-${index}`] && (
                                    <p className="text-xs text-red-400" role="alert">
                                        {errors[`question-${index}`]}
                                    </p>
                                )}

                                <label
                                    htmlFor={`security-answer-${index}`}
                                    className="block text-xs font-medium uppercase tracking-wide text-marquee-muted"
                                >
                                    {t('securityQuestions.answerLabel')}
                                </label>
                                <div className="relative">
                                    <input
                                        id={`security-answer-${index}`}
                                        type={question.visible ? 'text' : 'password'}
                                        autoComplete="off"
                                        value={question.answer}
                                        onChange={(event) =>
                                            updateQuestion(index, 'answer', event.target.value)
                                        }
                                        placeholder={t(
                                            'securityQuestions.answerPlaceholder'
                                        )}
                                        maxLength={256}
                                        aria-invalid={Boolean(errors[`answer-${index}`])}
                                        className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-3 py-2.5 pr-11 text-sm text-marquee-cream outline-none placeholder:text-marquee-muted/60 focus:border-marquee-gold"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuestion(
                                                index,
                                                'visible',
                                                !question.visible
                                            )
                                        }
                                        aria-label={
                                            question.visible
                                                ? t('securityQuestions.hideAnswer')
                                                : t('securityQuestions.showAnswer')
                                        }
                                        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-marquee-muted hover:text-marquee-gold"
                                    >
                                        {question.visible ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors[`answer-${index}`] && (
                                    <p className="text-xs text-red-400" role="alert">
                                        {errors[`answer-${index}`]}
                                    </p>
                                )}
                            </div>
                        ))}

                        <div className="rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3 space-y-2">
                            <label
                                htmlFor="security-questions-current-password"
                                className="flex items-center gap-2 text-sm font-medium text-marquee-cream"
                            >
                                <LockKeyhole className="h-4 w-4 text-marquee-gold" />
                                {t('securityQuestions.confirmCurrentPassword')}
                            </label>
                            <input
                                id="security-questions-current-password"
                                type="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(event) =>
                                    setCurrentPassword(event.target.value)
                                }
                                className="w-full rounded-lg border border-marquee-line bg-marquee-bg px-3 py-2.5 text-sm text-marquee-cream outline-none focus:border-marquee-gold"
                            />
                            {errors.currentPassword && (
                                <p className="text-xs text-red-400" role="alert">
                                    {errors.currentPassword}
                                </p>
                            )}
                            <p className="text-xs text-marquee-muted">
                                {t('securityQuestions.passwordConfirmationNote')}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-sm font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {saving
                                    ? t('securityQuestions.saving')
                                    : t('securityQuestions.saveQuestions')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false);
                                    setErrors({});
                                    setCurrentPassword('');
                                    setFormQuestions(emptyQuestions());
                                }}
                                className="inline-flex items-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-sm font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold"
                            >
                                {t('securityQuestions.cancel')}
                            </button>
                        </div>
                    </form>
                ) : configured ? (
                    <div className="mt-5 space-y-3">
                        {questions.map((question, index) => (
                            <div
                                key={question.id}
                                className="flex flex-col gap-2 rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                                        <CircleQuestionMark className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase tracking-wide text-marquee-muted">
                                            {t('securityQuestions.questionNumber', {
                                                number: index + 1,
                                            })}
                                        </p>
                                        <p className="mt-1 break-words text-sm text-marquee-cream">
                                            {question.questionText}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className="shrink-0 text-sm tracking-widest text-marquee-muted"
                                    aria-label={t('securityQuestions.answerHidden')}
                                >
                                    ••••••••
                                </span>
                            </div>
                        ))}

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-marquee-muted">
                                {t('securityQuestions.lastUpdated', {
                                    date: lastUpdated
                                        ? new Date(lastUpdated).toLocaleString('en-GB')
                                        : '—',
                                })}
                            </p>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-500/30 bg-marquee-bg/40 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                {t('securityQuestions.removeQuestions')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-5 text-sm text-marquee-muted">
                        {t('securityQuestions.noQuestionsConfigured')}
                    </p>
                )}
            </div>

            {confirmDelete && (
                <Modal
                    isOpen={confirmDelete}
                    onClose={() => {
                        if (!deleting) {
                            setConfirmDelete(false);
                            setDeletePassword('');
                            setShowDeletePassword(false);
                        }
                    }}
                    title={t('securityQuestions.removeModalTitle')}
                    closeDisabled={deleting}
                >
                    <form onSubmit={handleDelete} className="mt-2 space-y-4">
                        <p className="text-sm leading-relaxed text-marquee-muted">
                            {t('securityQuestions.removeModalDescription')}
                        </p>

                        <div className="space-y-2">
                            <label
                                htmlFor="remove-security-questions-password"
                                className="block text-sm font-medium text-marquee-cream"
                            >
                                {t('securityQuestions.currentPassword')}
                            </label>

                            <div className="relative">
                                <input
                                    id="remove-security-questions-password"
                                    type={showDeletePassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={deletePassword}
                                    onChange={(event) =>
                                        setDeletePassword(event.target.value)
                                    }
                                    disabled={deleting}
                                    required
                                    className="w-full rounded-lg border border-marquee-line bg-marquee-panel2 px-3 py-2.5 pr-11 text-sm text-marquee-cream outline-none transition-colors focus:border-marquee-gold disabled:opacity-50"
                                />

                                <button
                                    type="button"
                                    aria-label={
                                        showDeletePassword
                                            ? t('securityQuestions.hidePassword')
                                            : t('securityQuestions.showPassword')
                                    }
                                    onClick={() =>
                                        setShowDeletePassword((prev) => !prev)
                                    }
                                    disabled={deleting}
                                    className="absolute inset-y-0 right-0 grid w-11 place-items-center text-marquee-muted transition-colors hover:text-marquee-gold disabled:opacity-50"
                                >
                                    {showDeletePassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 pt-2">
                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() => {
                                    setConfirmDelete(false);
                                    setDeletePassword('');
                                    setShowDeletePassword(false);
                                }}
                                className="inline-flex items-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-sm font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50"
                            >
                                {t('securityQuestions.cancel')}
                            </button>

                            <button
                                type="submit"
                                disabled={deleting || !deletePassword}
                                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 disabled:opacity-50"
                            >
                                {deleting && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                <Trash2 className="h-3.5 w-3.5" />
                                {deleting
                                    ? t('securityQuestions.removing')
                                    : t('securityQuestions.removeQuestions')}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}