import { useState, useEffect } from "react";
import { useForm } from "../../hooks/newForm";
import { ToolTip } from "../../components/ToolTip";
import { FaInfoCircle } from "react-icons/fa";
import { useFetchGenerateResponses } from "../../hooks/useFetchAIGenerateResponses"
import { useFetchGenerate } from "../../hooks/useFetchAIGenerate"
import { Layout } from "../../components/layout/Layout.component";

export const Preguntas = () => {

    const { fetchOllama, generateResponse, loading } = useFetchGenerate()
    const { fetchOllamaResponses, generateResponseAI, loadingResponses } = useFetchGenerateResponses()

    const formValues = {
        consulta: "",
        //   model: "cm-llama3.1"
    }

    const responsesValues = {
        pregunta1: "",
        pregunta2: "",
        pregunta3: "",
        pregunta4: "",
        pregunta5: "",
        pregunta6: "",
        pregunta7: "",
        pregunta8: "",
        pregunta9: "",
        pregunta10: "",
    }

    const { values, handleChange, handleSubmit } = useForm(formValues)
    const { values: responses, handleChange: handleChange2, handleSubmit: handleSubmit2 } = useForm(responsesValues)

    const [shouldFetch, setShouldFetch] = useState(false);
    const [shouldFetchCorrection, setShouldFetchCorrection] = useState(false);

    const [parsedActivity, setParsedActivity] = useState([])

    const onSubmit = async () => {
        try {
            if (values.consulta !== "") {
                console.log("entro");
                setShouldFetch(true);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (shouldFetch) {
                    await fetchOllama("/mcgenerate", true, values);
                    setShouldFetch(false); // Resetea shouldFetch para evitar llamadas repetidas
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
    }, [shouldFetch]);

    useEffect(() => {
        if (generateResponse) {
            // Aquí es donde procesas generateResponse después de que fetch se complete
            const preguntasArray = generateResponse.split(/\n\d+\.\s/).filter(Boolean);
            // Convertir el array en un array de objetos con una clave 'text'
            const preguntasObjeto = preguntasArray.map((pregunta, index) => ({
                id: index,  // O puedes usar otro identificador único si es necesario
                text: pregunta.trim()
            }));
            setParsedActivity(preguntasObjeto);
        }
    }, [generateResponse]);


    const concatenatedString = parsedActivity.slice(1).map((question, index) => {
        const answer = responses[`pregunta${index + 1}`];
        return `Pregunta: ${question.text}
        Respuesta del usuario: ${answer}`;
    }).join('\n');

    // const concatenatedString = parsedActivity.slice(1).map((question, index) => {
    //      const answer = responses[`pregunta${index + 1}`];
    //       return `Pregunta${index + 1}: ${question.text}
    //       Respuesta${index + 1}:${answer}`;
    //   }).join('\n');

    const payload = {
        consulta: concatenatedString
    }
    //// CORRECCION
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (shouldFetchCorrection) {
                    await fetchOllamaResponses("/questioncorrection", true, payload);
                    setShouldFetchCorrection(false); // Resetea shouldFetch para evitar llamadas repetidas
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
    }, [shouldFetchCorrection]);

    const onSubmitCorrection = async () => {
        try {
            if (payload.consulta !== "") {
                setShouldFetchCorrection(true);
                console.log("empezo a corregir");
            }
        } catch (error) {
            console.error(error);
        }
    }

    console.log(generateResponseAI);

    return (
        <Layout>
            <div className="flex flex-col w-full">

                <h1 className={`text-neutral-200 text-2xl text-center py-4 font-bold font-roboto-mono`}>Preguntas de respuesta Libre</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="w-full px-24">
                    <div className="flex space-x-4 items-center">
                        <ToolTip bgColor={"bg-blue-400"} borderColor={"border-blue-400"} icon={<FaInfoCircle />} iconColor={"text-blue-500"} text={"Solo debes introducir el tema del cual te interese aprender"} />

                        <input type="text" placeholder="¿Sobre que tema quieres aprender?" className="w-full rounded h-10 p-2" value={values.consulta} onChange={handleChange} name="consulta" id="consulta" />

                        <button
                            className="bg-slate-400 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 hover:scale-110"
                            type="submit"
                        >
                            ¡Enviar!
                        </button>
                    </div>
                </form>


                {loading && (
                    <div className="flex justify-center items-center p-5">
                        <svg className="mr-3 h-20 w-20 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}

                <section className={`grid grid-cols-2 grid-rows-1 py-3 text-white space-x-5 w-full`}>

                    <div className="border-2 border-white space-y-4 p-5 rounded-md">
                        <h2 className="text-xl font-bold">Preguntas</h2>
                        <ul className="text-left space-y-2 font-semibold">
                            {parsedActivity.slice(1).map((activity) => (
                                <li id={activity.id}>Pregunta N°{activity.id}: {activity.text}</li>
                            ))}
                        </ul>
                    </div>

                    <form className="border-2 border-white flex flex-col space-y-4 p-5 rounded-md w-full" onSubmit={handleSubmit2(onSubmitCorrection)}>
                        <h2 className="text-xl font-bold">Tus respuestas</h2>
                        {parsedActivity.slice(1).map((input) => (
                            <>
                                <div className="flex w-full space-x-2">
                                    <span>{input.id}</span>
                                    <input id={`pregunta${input.id}`} type="text" className="rounded-md w-full text-slate-800"
                                        name={`pregunta${input.id}`} placeholder={`Tu respuesta para la pregunta${input.id}`}
                                        onChange={handleChange2} />
                                </div>

                            </>
                        ))}

                        {parsedActivity.length == 11 &&
                            <div >
                                <button type="submit" className="bg-slate-400 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 hover:scale-110">Corregir</button>
                            </div>
                        }

                        <div className="text-white flex flex-col justify-center items-center text-center">
                            {loadingResponses && (<span>Cargando su corrección...</span>)}
                            <span>{generateResponseAI}</span>
                        </div>
                    </form>

                </section>
            </div>
        </Layout>
    );
};
