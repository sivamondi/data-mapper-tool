import { useState, useCallback } from 'react';
import styles from './DataMapper.module.css';

interface Attribute {
  id: string;
  name: string;
  mapped?: boolean;
}

interface Mapping {
  source1Attribute: string;
  source2Attribute: string;
}

// Add new interface for API response
interface MappingResponse {
  source1Unmapped: Attribute[];
  source2Unmapped: Attribute[];
  mappedData: Mapping[];
}

export function DataMapper() {
  const [source1File, setSource1File] = useState<File | null>(null);
  const [source2File, setSource2File] = useState<File | null>(null);
  const [draggedAttribute, setDraggedAttribute] = useState<string | null>(null);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mappingGenerated, setMappingGenerated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mock data for demonstration
  const [source1Attributes, setSource1Attributes] = useState<Attribute[]>([
    { id: '1', name: 'attribute1' },
    { id: '2', name: 'attribute2' },
    { id: '3', name: 'attribute3' },
    { id: '4', name: 'attribute4' }
  ]);

  const [source2Attributes, setSource2Attributes] = useState<Attribute[]>([
    { id: '1', name: 'field1' },
    { id: '2', name: 'field2' },
    { id: '3', name: 'field3' },
    { id: '4', name: 'field4' }
  ]);

  const handleFileChange = (source: 'source1' | 'source2', file: File | null) => {
    if (source === 'source1') {
      setSource1File(file);
      // Here you would parse the CSV and update source1Attributes
    } else {
      setSource2File(file);
      // Here you would parse the CSV and update source2Attributes
    }
  };

  const handleDragStart = (attribute: string) => {
    setDraggedAttribute(attribute);
  };

  const handleDrop = useCallback((targetAttribute: string, targetSource: 'source1' | 'source2') => {
    if (!draggedAttribute) return;

    // Prevent dropping on the same source
    if ((draggedAttribute.startsWith('source1') && targetSource === 'source1') ||
        (draggedAttribute.startsWith('source2') && targetSource === 'source2')) {
      return;
    }

    const source1Attr = targetSource === 'source2' ? draggedAttribute : targetAttribute;
    const source2Attr = targetSource === 'source1' ? draggedAttribute : targetAttribute;

    // Add new mapping
    setMappings(prev => [...prev, {
      source1Attribute: source1Attr,
      source2Attribute: source2Attr
    }]);

    // Update attributes to show as mapped
    setSource1Attributes(prev => 
      prev.map(attr => 
        attr.name === source1Attr ? { ...attr, mapped: true } : attr
      )
    );
    setSource2Attributes(prev => 
      prev.map(attr => 
        attr.name === source2Attr ? { ...attr, mapped: true } : attr
      )
    );

    setDraggedAttribute(null);
  }, [draggedAttribute]);

  const handleRemoveMapping = (mapping: Mapping) => {
    setMappings(prev => prev.filter(m => 
      m.source1Attribute !== mapping.source1Attribute || 
      m.source2Attribute !== mapping.source2Attribute
    ));

    // Update attributes to show as unmapped
    setSource1Attributes(prev => 
      prev.map(attr => 
        attr.name === mapping.source1Attribute ? { ...attr, mapped: false } : attr
      )
    );
    setSource2Attributes(prev => 
      prev.map(attr => 
        attr.name === mapping.source2Attribute ? { ...attr, mapped: false } : attr
      )
    );
  };

  const handleGenerateMapping = async () => {
    if (!source1File || !source2File) {
      setError('Please select both source files');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsAnimating(true);

    try {
      // First wait for 5 seconds for the bot animation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Generate mock data...
      const mockSource1Unmapped = Array.from({ length: 50 }, (_, i) => ({
        id: `s${i + 1}`,
        name: `source_field_${i + 1}`,
        mapped: false
      }));

      const mockSource2Unmapped = Array.from({ length: 50 }, (_, i) => ({
        id: `d${i + 1}`,
        name: `destination_field_${i + 1}`,
        mapped: false
      }));

      // Generate 50+ mock mapped attributes
      const mockMappedData = Array.from({ length: 50 }, (_, i) => ({
        source1Attribute: `mapped_source_${i + 1}`,
        source2Attribute: `mapped_destination_${i + 1}`
      }));

      // Mock API response
      const mockResponse: MappingResponse = {
        source1Unmapped: mockSource1Unmapped,
        source2Unmapped: mockSource2Unmapped,
        mappedData: mockMappedData
      };
      
      // Update the state with mock response
      setSource1Attributes(mockResponse.source1Unmapped);
      setSource2Attributes(mockResponse.source2Unmapped);
      setMappings(mockResponse.mappedData);
      setMappingGenerated(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsAnimating(false);
    }
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(mappings, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mapped-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Add this function to format JSON with syntax highlighting
  const formatJSON = (json: any) => {
    const jsonString = JSON.stringify(json, null, 2);
    return jsonString.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let className = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            className = 'key';
          } else {
            className = 'string';
          }
        } else if (/true|false/.test(match)) {
          className = 'boolean';
        } else if (/null/.test(match)) {
          className = 'null';
        }
        return `<span class="${className}">${match}</span>`;
      }
    );
  };

  return (
    <div className={styles.container}>
      {isAnimating && (
        <div className={styles.botAnimationContainer}>
          <div className={styles.botAnimation}>
            <div className={styles.botIcon}>🤖</div>
            <div className={styles.botTrail}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Data Mapper Tool</h1>
        <nav className={styles.nav}>
          {/* Removing the Data Lineage link */}
        </nav>
      </header>

      <div className={styles.content}>
        <div className={styles.promptSection}>
          <div className={styles.promptContainer}>
            <label htmlFor="prompt">Prompt</label>
            <textarea 
              id="prompt"
              className={styles.promptTextArea}
              rows={5}
              placeholder="Enter your prompt here..."
            />
          </div>
          {mappingGenerated && (
            <div className={styles.matchStatus}>
              <div className={styles.matchStatusItem}>
                <span className={styles.checkIcon}>✓</span>
                <span>70% matched</span>
              </div>
              <div className={styles.matchStatusItem}>
                <span className={styles.suggestedIcon}>?</span>
                <span>20% suggested</span>
              </div>
              <div className={styles.matchStatusItem}>
                <span className={styles.unmatchedIcon}>×</span>
                <span>10% unmatched</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.uploadSection}>
          <div className={styles.sourceContainer}>
            <h3>Source</h3>
            <div className={styles.fileInputContainer}>
              <input
                type="file"
                onChange={(e) => handleFileChange('source1', e.target.files?.[0] || null)}
                className={styles.fileInput}
                accept=".csv"
              />
              {source1File && <p>Selected: {source1File.name}</p>}
            </div>
          </div>

          <div className={styles.sourceContainer}>
            <h3>Destination</h3>
            <div className={styles.fileInputContainer}>
              <input
                type="file"
                onChange={(e) => handleFileChange('source2', e.target.files?.[0] || null)}
                className={styles.fileInput}
                accept=".csv"
              />
              {source2File && <p>Selected: {source2File.name}</p>}
            </div>
          </div>

          <button
            className={`${styles.generateButton} ${styles.apiButton}`}
            onClick={handleGenerateMapping}
            disabled={!source1File || !source2File || isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Mapping'}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.mappingSection}>
          <div className={styles.sourceAttributes}>
            <h3>Unmapped Source Attributes</h3>
            <div className={styles.attributeList}>
              {mappingGenerated && source1Attributes.map(attr => (
                <div
                  key={attr.id}
                  className={`${styles.attribute} ${attr.mapped ? styles.mapped : ''}`}
                  draggable={!attr.mapped}
                  onDragStart={() => handleDragStart(attr.name)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    handleDrop(attr.name, 'source1');
                  }}
                >
                  {attr.name}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sourceAttributes}>
            <h3>Unmapped Destination Attributes</h3>
            <div className={styles.attributeList}>
              {mappingGenerated && source2Attributes.map(attr => (
                <div
                  key={attr.id}
                  className={`${styles.attribute} ${attr.mapped ? styles.mapped : ''}`}
                  draggable={!attr.mapped}
                  onDragStart={() => handleDragStart(attr.name)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    handleDrop(attr.name, 'source2');
                  }}
                >
                  {attr.name}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.mappingArea}>
            <h3>Suggested Mappings</h3>
            <div className={styles.mappingList}>
              {mappings.map((mapping, index) => (
                <div key={index} className={styles.mappingItem}>
                  <span>{mapping.source1Attribute}</span>
                  <span className={styles.mappingArrow}>→</span>
                  <span>{mapping.source2Attribute}</span>
                  <button 
                    className={styles.removeMapping}
                    onClick={() => handleRemoveMapping(mapping)}
                  >
                    
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.mappedDataContainer}>
          <div className={styles.mappedDataSection}>
            <h3>Mapped Data</h3>
            <pre 
              className={styles.jsonDisplay}
              dangerouslySetInnerHTML={{ __html: formatJSON(mappings) }}
            />
          </div>
          <button
            className={`${styles.generateButton} ${styles.downloadButton}`}
            onClick={handleDownload}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
} 