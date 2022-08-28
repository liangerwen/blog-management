import { useState, useEffect } from 'react';
import Carousel, { Modal, ModalGateway } from 'react-images';
import type { ViewType } from 'react-images';

type PropsType = {
  images: ViewType[];
  open: boolean;
  onClose?: () => void;
};

const PreviewImage: React.FC<PropsType> = ({ images = [], open, onClose }) => {
  const [modalIsOpen, setModalIsOpen] = useState(open);
  useEffect(() => {
    setModalIsOpen(open);
  }, [images, open]);

  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen);
    if (typeof onClose === 'function') {
      onClose();
    }
  };
  return (
    <ModalGateway>
      {modalIsOpen ? (
        <Modal onClose={toggleModal}>
          <Carousel views={images} />
        </Modal>
      ) : null}
    </ModalGateway>
  );
};

export default PreviewImage;
