'use client';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


export default function Hero() {

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const emailValue = formData.get('email') as string;
        const isValid = emailRegex.test(emailValue);

        if (!emailValue?.trim() || !isValid) {
            alert('Please enter a valid email');
            return;
        }
    }

    return (
        <div className="flex flex-col items-center space-y-3 xl:space-y-5 mt-48 mb-20">
            <h1 className="
            text-5xl xl:text-6xl text-white dark:text-zinc-200
            font-semibold tracking-tighter leading-14 md:leading-16 max-w-sm md:max-w-2xl xl:max-w-lg text-center"
            >
                The Intelligent Intake Workflow
            </h1>
            <p className="text-white dark:text-zinc-200 text-xl max-w-sm md:max-w-lg text-center">
                Safe and efficient client intake that helps legal teams hit the ground running with potential clients
            </p>
            <div className="flex flex-col space-y-5 md:flex-row items-center mt-10">
                <form
                onSubmit={handleSubmit}
                className="space-x-3">
                    <input
                        name="email"
                        id="email"
                        type="text"
                        placeholder="Email address"
                        aria-label="Please enter your email address"
                        className="ring-1 ring-zinc-100 focus:ring-white rounded-2xl h-10 w-96 text-center"
                    />
                    <button
                        type="submit"
                        className="
                font-medium bg-sky-700 dark:bg-sky-800 text-zinc-50 py-2 px-4 rounded-2xl
                hover:bg-sky-600 hover:dark:bg-sky-700 transition-all duration-300 cursor-pointer mx-auto"
                    >
                        Get Started
                    </button>
                </form>
            </div>
        </div>
    )
}