import pool, { KmzFile, KmzCoordinate } from './database';
import { parseKmzFile, ParsedKmzCoordinate } from './kmzParser';

export interface KmzCoordinateData {
  latitude: number;
  longitude: number;
  name?: string;
  description?: string;
}

/**
 * Busca todos os arquivos KMZ carregados
 */
export async function getKmzFiles(): Promise<KmzFile[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM kmz_files ORDER BY uploaded_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar arquivos KMZ:', error);
    return [];
  }
}

/**
 * Busca todas as coordenadas de arquivos KMZ processados
 */
export async function getKmzCoordinates(): Promise<KmzCoordinateData[]> {
  try {
    const result = await pool.query(
      'SELECT latitude, longitude, name, description FROM kmz_coordinates ORDER BY id'
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar coordenadas KMZ:', error);
    return [];
  }
}

/**
 * Busca coordenadas de um arquivo KMZ específico
 */
export async function getKmzCoordinatesByFileId(fileId: string): Promise<KmzCoordinateData[]> {
  try {
    const result = await pool.query(
      'SELECT latitude, longitude, name, description FROM kmz_coordinates WHERE kmz_file_id = $1 ORDER BY id',
      [fileId]
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar coordenadas do arquivo KMZ:', error);
    return [];
  }
}

/**
 * Marca um arquivo KMZ como processado
 */
export async function markKmzAsProcessed(fileId: string): Promise<boolean> {
  try {
    await pool.query(
      'UPDATE kmz_files SET processed = true, processed_at = CURRENT_TIMESTAMP WHERE id = $1',
      [fileId]
    );
    return true;
  } catch (error) {
    console.error('Erro ao marcar arquivo KMZ como processado:', error);
    return false;
  }
}

/**
 * Adiciona coordenadas extraídas de um arquivo KMZ
 */
export async function addKmzCoordinates(fileId: string, coordinates: KmzCoordinateData[]): Promise<boolean> {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const coord of coordinates) {
        await client.query(
          'INSERT INTO kmz_coordinates (kmz_file_id, latitude, longitude, name, description) VALUES ($1, $2, $3, $4, $5)',
          [fileId, coord.latitude, coord.longitude, coord.name || null, coord.description || null]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao adicionar coordenadas KMZ:', error);
    return false;
  }
}

/**
 * Remove um arquivo KMZ e suas coordenadas
 */
export async function deleteKmzFile(fileId: string): Promise<boolean> {
  try {
    // As coordenadas serão removidas automaticamente por CASCADE
    await pool.query('DELETE FROM kmz_files WHERE id = $1', [fileId]);
    return true;
  } catch (error) {
    console.error('Erro ao remover arquivo KMZ:', error);
    return false;
  }
}

/**
 * Salva um arquivo KMZ no banco de dados
 */
export async function saveKmzFile(
  filename: string,
  originalName: string,
  fileSize: number,
  storagePath: string
): Promise<string | null> {
  try {
    const result = await pool.query(
      'INSERT INTO kmz_files (filename, original_name, file_size, storage_path) VALUES ($1, $2, $3, $4) RETURNING id',
      [filename, originalName, fileSize, storagePath]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error('Erro ao salvar arquivo KMZ:', error);
    return null;
  }
}

/**
 * Processa um arquivo KMZ, extraindo coordenadas e salvando-as no banco de dados.
 * @param fileId O ID do arquivo KMZ no banco de dados.
 * @param kmzBlob O conteúdo do arquivo KMZ como Blob.
 * @returns True se o processamento for bem-sucedido, false caso contrário.
 */
export async function processKmzFile(fileId: string, kmzBlob: Blob): Promise<boolean> {
  try {
    const parsedCoordinates: ParsedKmzCoordinate[] = await parseKmzFile(kmzBlob);

    if (parsedCoordinates.length > 0) {
      const success = await addKmzCoordinates(fileId, parsedCoordinates);
      if (success) {
        await markKmzAsProcessed(fileId);
        return true;
      }
    }
    console.warn('Nenhuma coordenada válida encontrada no arquivo KMZ ou erro ao adicionar.');
    return false;
  } catch (error) {
    console.error('Erro ao processar arquivo KMZ:', error);
    return false;
  }
}

/**
 * Obtém a URL pública de um arquivo KMZ
 */
export async function getKmzFileUrl(storagePath: string): Promise<string | null> {
  // Para implementação futura com storage de arquivos
  console.warn("getKmzFileUrl não implementado para o novo sistema de storage.");
  return null;
}

