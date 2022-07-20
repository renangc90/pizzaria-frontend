import Head from "next/head";
import { Header } from "../../components/Header";
import styles from "./styles.module.scss"
import { setupAPIClient } from "../../services/api";
import { toast } from 'react-toastify'
import { canSSRAuth } from "../../utils/canSSRAuth";
import { FiUpload } from "react-icons/fi";
import { ChangeEvent, FormEvent, useState } from "react";
import { api } from "../../services/apiClient";

type ItemProps = {
    id: string;
    name: string;
}

interface CategoryProps {
    categoryList: ItemProps[]
}

export default function Product({ categoryList }: CategoryProps) {

    const [avatarUrl, setAvatarUrl] = useState('')
    const [imageAvatar, setImageAvatar] = useState(null)

    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')

    const [categories, setCategories] = useState(categoryList || [])
    const [categorySelected, setCategorySelected] = useState(0)

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) {
            return
        }

        const image = e.target.files[0]

        if (!image) {
            return
        }

        if (image.type === 'image/jpeg' || image.type === 'image/png') {

            setImageAvatar(image)
            //preview da imagem
            setAvatarUrl(URL.createObjectURL(e.target.files[0]))
        }
    }

    function handleChangeCategory(e) {
        setCategorySelected(e.target.value)
    }

    async function handleRegister(e: FormEvent) {
        e.preventDefault()

        try {
            const data = new FormData()

            if (name === '' || price === '' || description === '' || imageAvatar === '') {
                toast.error('Preencha todos os campos!')
                return
            }

            data.append('name', name)
            data.append('price', price)
            data.append('description', description)
            data.append('category_id', categories[categorySelected].id)
            data.append('file', imageAvatar)

            const apiClient = setupAPIClient()

            await apiClient.post('/product', data)

            toast.success('Cadastrado com sucesso!')


        } catch (error) {
            toast.error('Erro ao cadastrar!')
        }

        setName('')
        setPrice('')
        setDescription('')
        setImageAvatar(null)
        setAvatarUrl('')
    }

    return (
        <>
            <Head>
                <title>Novo produto - Pizzaria</title>
            </Head>
            <div>
                <Header />
                <main className={styles.container}>
                    <h1>Novo produto</h1>

                    <form className={styles.form} onSubmit={handleRegister}>

                        <label className={styles.labelAvatar}>
                            <span>
                                <FiUpload size={30} color="#fff" />
                            </span>

                            <input type="file" accept="image/png, imagem/jpeg" onChange={handleFile} />

                            {imageAvatar && (
                                <img
                                    className={styles.preview}
                                    src={avatarUrl}
                                    alt="Foto do produto"
                                    width={250}
                                    height={250}
                                />
                            )}
                        </label>


                        <select value={categorySelected} onChange={handleChangeCategory}>
                            {categories.map((item, index) => {
                                return (
                                    <option key={item.id} value={index}>
                                        {item.name}
                                    </option>
                                )
                            })}
                        </select>

                        <input
                            type="text"
                            placeholder="Digite o nome do produto"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                        />

                        <input
                            type="text"
                            placeholder="Preço do produto"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={styles.input}
                        />

                        <textarea
                            placeholder="Descreva o seu produto"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.input}
                        />

                        <button className={styles.buttonAdd} type="submit">
                            Cadastrar
                        </button>
                    </form>
                </main>
            </div>
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx) => {

    const apiCliente = setupAPIClient(ctx)
    //mostrar no select as categorias
    const response = await apiCliente.get('/category')


    return {
        props: {
            categoryList: response.data
        }
    }
})